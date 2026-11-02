import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/layout/AuthShell";
import { Button, Field, ErrorBanner } from "../components/ui";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";

export default function Login() {
  const { user, login, googleLogin } = useAuth();
  const nav = useNavigate();
  const from = useLocation().state?.from?.pathname || "/dashboard";
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({
        username: form.identifier,
        email: form.identifier,
        password: form.password,
      });
      nav(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setError("");
    setLoading(true);
    try {
      await googleLogin(credential);
      nav(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Enter your details to continue."
      footer={
        <>
          New to IntellMeet?{" "}
          <Link to="/register" className="font-semibold text-brand">
            Create an account
          </Link>
        </>
      }
    >
      <ErrorBanner message={error} />
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Username or Email"
          type="text"
          required
          value={form.identifier}
          onChange={(e) => setForm({ ...form, identifier: e.target.value })}
        />
        <Field
          label="Password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          or
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <GoogleLoginButton
        onSuccess={handleGoogleSuccess}
        onError={setError}
        disabled={loading}
      />
    </AuthShell>
  );
}
