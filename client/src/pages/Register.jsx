import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/layout/AuthShell";
import { Button, Field, ErrorBanner } from "../components/ui";

export default function Register() {
  const { user, register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm)
      return setError("Passwords do not match.");

    setLoading(true);
    try {
      await register({
        fullname: form.fullname,
        username: form.username,
        email: form.email,
        password: form.password,
      });
      nav("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start hosting smarter meetings."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-brand">
            Sign in
          </Link>
        </>
      }
    >
      <ErrorBanner message={error} />
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Full name"
          required
          value={form.fullname}
          onChange={set("fullname")}
        />
        <Field
          label="Username (optional)"
          value={form.username}
          onChange={set("username")}
          placeholder="leave blank to auto-generate"
        />
        <Field
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={set("email")}
        />
        <Field
          label="Password (8+ characters)"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={set("password")}
        />
        <Field
          label="Confirm password"
          type="password"
          required
          value={form.confirm}
          onChange={set("confirm")}
        />
        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
