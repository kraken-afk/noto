import './app.css';

interface PageProps {
  csrf_token: string;
  action: string;
  error?: string;
}

export default function Page({ csrf_token, action, error }: PageProps) {
  return (
    <div className="w-full h-dvh flex flex-col items-center justify-center">
      <h1 className="font-semibold font-serif mb-4 text-4xl">Login to Noto</h1>
      <form method="POST" action={action} className="h-fit w-full max-w-sm">
        <input type="hidden" name="csrfmiddlewaretoken" value={csrf_token} />
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Username</legend>
          <input
            type="text"
            className="input w-full"
            placeholder="Type here"
            name="username"
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Password</legend>
          <input
            type="password"
            className="input w-full"
            placeholder="Type here"
            name="password"
          />
        </fieldset>
        <button type="submit" className="btn btn-primary my-4 btn-block">
          Login
        </button>
      </form>
      {error && <span className="text-xs text-red-500">{error}</span>}
      <p className="text-xs mt-4">
        If you don't have an account, please{' '}
        <a href="/register" className="underline font-serif">
          register
        </a>
      </p>
    </div>
  );
}
