import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Button, PageHeader, Panel } from "../components/ui";

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notify, setNotify] = useState(
    () => localStorage.getItem("im_notify") !== "off",
  );
  const toggleNotify = (v) => {
    setNotify(v);
    localStorage.setItem("im_notify", v ? "on" : "off");
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your IntellMeet account preferences."
      />
      <div className="max-w-2xl space-y-6">
        <Panel title="Profile">
          <dl className="grid grid-cols-[100px_1fr] gap-y-3 text-sm">
            <dt className="text-muted">Name</dt>
            <dd className="font-medium">{user.fullname}</dd>
            <dt className="text-muted">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </dl>
        </Panel>
        <Panel title="Appearance">
          <div className="flex gap-2">
            {["light", "dark"].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize ${theme === t ? "border-brand bg-brand/10 text-brand-dark" : "border-line"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Notifications">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => toggleNotify(e.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            Notify me before meetings start
          </label>
        </Panel>
        <Panel title="Session">
          <Button variant="danger" onClick={logout}>
            Log out
          </Button>
        </Panel>
      </div>
    </>
  );
}
