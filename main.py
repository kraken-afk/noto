import sys
import threading
import time
from pathlib import Path
import subprocess
import signal
import os

# Global process list for cleanup
processes = []


def shutdown(*_):
    """Gracefully terminate all processes"""
    print('Shutting down all processes...')
    for p in processes:
        try:
            p.terminate()
            # Give process time to terminate gracefully
            p.wait(timeout=3)
        except:
            # Force kill if necessary
            try:
                p.kill()
            except:
                pass
    sys.exit(0)


def read_stream(name: str, stream: str):
    """Read from process output streams and print with prefix"""
    try:
        for line in stream:
            if line:
                print(f'[{name}] {line}', end='')
    except Exception as e:
        print(f'Error reading {name} stream: {e}')


def start_process(cmd: list[str], name: str):
    """Start a subprocess with stdout/stderr handling"""
    try:
        print(f'Starting {name} process...')
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,  # Line buffered
        )
        processes.append(process)

        # Start threads to read output
        if process.stdout:
            threading.Thread(
                target=read_stream,
                args=(f'{name}', process.stdout),
                daemon=True,
            ).start()
        if process.stderr:
            threading.Thread(
                target=read_stream,
                args=(f'{name}-err', process.stderr),
                daemon=True,
            ).start()

        return process
    except Exception as e:
        print(f'Failed to start {name} process: {e}')
        return None


def run_dev_environment():
    """Run the development environment without using watchfiles"""
    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    # Dictionary to store last modification times of files
    last_check = {}

    # Initial file scan - populate last_check without triggering rebuilds
    print('Performing initial file scan...')
    for root, _, files in os.walk('.'):
        if (
            '__pycache__' in root
            or '.git' in root
            or '.venv' in root
            or 'node_modules' in root
        ):
            continue

        for file in files:
            if file.endswith(('.py', '.ts', '.tsx')):
                filepath = os.path.join(root, file)
                try:
                    last_check[filepath] = os.path.getmtime(filepath)
                except OSError:
                    pass

    print(f'Initial scan complete. Tracking {len(last_check)} files.')

    # Start the build process
    build_process = start_process(['bun', 'run', 'build'], 'build')
    if build_process:
        # Wait for the build to complete
        build_status = build_process.wait()
        if build_status != 0:
            print(f'Build failed with status code: {build_status}')
            return

    # Start the SSR process with its own watcher (bun has --watch built in)
    ssr_process = start_process(
        ['bun', 'run', '--watch', str(Path.cwd() / 'core/net/ssr.ts')],
        'ssr',
    )

    # Start Django development server
    django_process = start_process(
        ['python', str(Path.cwd() / 'manage.py'), 'runserver'], 'django'
    )

    try:
        while True:
            time.sleep(1)

            # Check if any of our managed processes died
            for proc in list(processes):
                if proc.poll() is not None:
                    print(
                        f'Process exited with code {proc.returncode}, restarting...'
                    )
                    processes.remove(proc)
                    # If Django process died, restart it
                    if proc == django_process:
                        django_process = start_process(
                            [
                                'python',
                                str(Path.cwd() / 'manage.py'),
                                'runserver',
                            ],
                            'django',
                        )
                    # If SSR process died, restart it
                    elif proc == ssr_process:
                        ssr_process = start_process(
                            [
                                'bun',
                                'run',
                                '--watch',
                                str(Path.cwd() / 'core/net/ssr.ts'),
                            ],
                            'ssr',
                        )

            # File watching for Python and TypeScript files
            # This doesn't use watchfiles library which seems problematic
            rebuild_needed = False
            restart_django = False

            for root, _, files in os.walk('.'):
                if (
                    '__pycache__' in root
                    or '.git' in root
                    or '.venv' in root
                    or 'node_modules' in root
                ):
                    continue

                for file in files:
                    filepath = os.path.join(root, file)

                    # Skip if file doesn't exist anymore
                    if not os.path.exists(filepath):
                        if filepath in last_check:
                            del last_check[filepath]
                        continue

                    mtime = os.path.getmtime(filepath)

                    # Check if file has been modified since last check
                    if filepath in last_check:
                        if last_check[filepath] != mtime:
                            # File was modified - update timestamp and trigger action
                            last_check[filepath] = mtime

                            # Handle different file types
                            if file.endswith(('.ts', '.tsx')):
                                print(
                                    f' file changed: {filepath}, triggering rebuild'
                                )
                                rebuild_needed = True
                            elif file.endswith(('.py', '.html')):
                                print(
                                    f'Django file changed: {filepath}, will restart Django server'
                                )
                                restart_django = True
                    else:
                        # New file discovered - just track it without triggering a rebuild
                        last_check[filepath] = mtime

            # Handle TypeScript changes - rebuild
            if rebuild_needed:
                print('Running build process...')
                # Kill any existing build process
                build_process = start_process(['bun', 'run', 'build'], 'build')
                if build_process:
                    # Wait for the build to complete
                    build_status = build_process.wait()
                    if build_status != 0:
                        print(f'Build failed with status code: {build_status}')
                    else:
                        print('Build completed successfully')

            # Handle Python changes - restart Django
            if restart_django:
                # Restart Django server if it's running
                if django_process and django_process.poll() is None:
                    django_process.terminate()
                    try:
                        django_process.wait(timeout=3)
                    except:
                        django_process.kill()
                    processes.remove(django_process)

                    # Start a new Django process
                    django_process = start_process(
                        ['python', str(Path.cwd() / 'manage.py'), 'runserver'],
                        'django',
                    )

    except KeyboardInterrupt:
        print('KeyboardInterrupt caught, stopping processes...')
        shutdown()


def main():
    """Main entry point"""
    args = sys.argv[1:]
    if not args:
        raise Exception('Missing command.')

    match args[0]:
        case 'dev':
            run_dev_environment()
        case _:
            raise Exception('Unknown command.')


if __name__ == '__main__':
    # No multiprocessing used anymore
    try:
        main()
    except KeyboardInterrupt:
        shutdown()
