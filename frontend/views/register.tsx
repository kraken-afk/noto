import './app.css';

interface PageProps {
  csrf_token: string;
  action: string;
  error?: string;
  username?: string;
  email?: string;
}

export default function Page({
  csrf_token,
  action,
  error,
  username,
  email,
}: PageProps) {
  return (
    <div className="w-full h-dvh flex flex-col items-center justify-center">
      <h1 className="font-semibold font-serif mb-4 text-4xl">
        Register to Noto
      </h1>
      <form method="POST" action={action} className="h-fit w-full max-w-sm">
        <input type="hidden" name="csrfmiddlewaretoken" value={csrf_token} />
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Username</legend>
          <input
            type="text"
            className="input w-full"
            placeholder="Enter username"
            name="username"
            defaultValue={username || ''}
            required
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Email</legend>
          <input
            type="email"
            className="input w-full"
            placeholder="Enter email"
            name="email"
            defaultValue={email || ''}
            required
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Password</legend>
          <input
            type="password"
            className="input w-full"
            placeholder="Enter password"
            name="password"
            required
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Confirm Password</legend>
          <input
            type="password"
            className="input w-full"
            placeholder="Confirm password"
            name="confirm_password"
            required
          />
        </fieldset>
        <button type="submit" className="btn btn-primary my-4 btn-block">
          Register
        </button>
      </form>
      {error && <span className="text-xs text-red-500">{error}</span>}
      <p className="text-xs mt-4">
        Already have an account?{' '}
        <a href="/login" className="underline font-serif">
          Login
        </a>
      </p>
    </div>
  );
}
