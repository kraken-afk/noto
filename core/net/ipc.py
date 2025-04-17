import socket
import json


def ssr(
    file: str,
    props: dict[str, str] | dict[str, str | int] | dict[str, str | None],
):
    response = send_ipc_message(json.dumps({'target': file, 'props': props}))
    return response


def send_ipc_message(message: str):
    client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    try:
        client.connect('/tmp/bun_notos_in')
        client.sendall(message.encode())
        response = client.recv(51200)
        return response.decode()
    except Exception as e:
        print('Socket error:', e)
        return None
    finally:
        client.close()
