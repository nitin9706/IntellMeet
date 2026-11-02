import { GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";

const GoogleGIcon = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.22 3.62l6.85-6.85C35.72 2.49 30.33 0 24 0 14.64 0 6.52 5.38 2.56 13.22l7.98 6.2C12.42 14.54 17.62 9.5 24 9.5Z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.55c0-1.6-.14-3.13-.4-4.55H24v8.62h12.84c-.56 3.03-2.27 5.59-4.84 7.28l7.85 6.09c4.58-4.22 7.65-10.44 7.65-17.44Z"
    />
    <path
      fill="#FBBC05"
      d="M32 34.35c-2.3 1.55-5.24 2.47-8 2.47-6.38 0-11.78-4.31-13.7-10.12l-7.98 6.2C5.15 41.82 13.77 48 24 48c7.31 0 13.46-2.4 17.94-6.5l-9.94-7.15Z"
    />
    <path
      fill="#34A853"
      d="M11.3 26.7A14.96 14.96 0 0 1 10.8 24c0-1.6.28-3.16.78-4.7L2.56 13.1A23.95 23.95 0 0 0 0 24c0 3.88.93 7.55 2.56 10.8l7.74-6.2Z"
    />
  </svg>
);

export default function GoogleLoginButton({
  onSuccess,
  onError,
  disabled = false,
  label = "Continue with Google",
}) {
  const handleSuccess = (credentialResponse) => {
    if (credentialResponse?.credential) {
      onSuccess?.(credentialResponse.credential);
      return;
    }

    onError?.("Google login failed.");
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() =>
        onError?.("Google sign-in was dismissed. Please try again.")
      }
      useOneTap={false}
      text="continue_with"
      shape="rectangular"
      width="100%"
      logo_alignment="left"
      render={({ onClick, disabled: googleDisabled }) => (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled || googleDisabled}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 text-sm font-semibold text-ink shadow-sm transition-all duration-200 hover:border-brand/40 hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {disabled || googleDisabled ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted" />
          ) : (
            <GoogleGIcon />
          )}
          <span>
            {disabled || googleDisabled ? "Loading Google..." : label}
          </span>
        </button>
      )}
    />
  );
}
