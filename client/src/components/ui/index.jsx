import { AlertCircle, Loader2 } from "lucide-react";

export function Button({
  variant = "primary",
  className = "",
  loading,
  children,
  ...p
}) {
  const styles = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    ghost: "border border-line text-ink hover:bg-bg",
    danger: "bg-danger text-white hover:opacity-90",
  }[variant];
  return (
    <button
      disabled={loading || p.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${styles} ${className}`}
      {...p}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Field({ label, ...p }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
        {...p}
      />
    </label>
  );
}

export function Panel({ title, action, children, className = "" }) {
  return (
    <section
      className={`rounded-xl border border-line bg-surface ${className}`}
    >
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="font-display text-base font-bold">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between text-muted">
        <span className="text-sm">{label}</span>
        {Icon && <Icon size={18} />}
      </div>
      <p className="mt-3 font-display text-4xl font-bold">{value}</p>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-5 flex items-center gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
    >
      <AlertCircle size={18} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="font-semibold underline">
          Retry
        </button>
      )}
    </div>
  );
}

export function Empty({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      {Icon && <Icon size={32} className="mb-3 text-muted" />}
      <p className="font-display text-lg font-bold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-line bg-surface p-6"
      >
        <h2 className="mb-4 font-display text-xl font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export const StatusBadge = ({ status }) => {
  const map = {
    live: "bg-danger/15 text-danger",
    upcoming: "bg-brand/15 text-brand-dark",
    expired: "bg-line text-muted",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status]}`}
    >
      {status}
    </span>
  );
};
