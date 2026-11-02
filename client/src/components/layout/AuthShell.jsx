import AppLogo from "../ui/AppLogo";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-rail p-12 text-white lg:flex">
        <AppLogo className="text-white" textClassName="text-white" />
        <div>
          <h2 className="max-w-md font-display text-4xl font-bold leading-tight">
            Meetings that write their own follow-ups.
          </h2>
          <p className="mt-4 max-w-sm text-white/60">
            Host calls, record them, and turn the transcript into decisions and
            action items.
          </p>
        </div>
        <span className="text-sm text-white/40">AI-powered video meetings</span>
      </div>
      <div className="grid place-items-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="mb-6 mt-1 text-muted">{subtitle}</p>
          {children}
          <p className="mt-6 text-center text-sm text-muted">{footer}</p>
        </div>
      </div>
    </div>
  );
}
