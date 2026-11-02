import { useState } from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  CalendarDays,
  MessagesSquare,
  Sparkles,
  PlayCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AppLogo from "../ui/AppLogo";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/meetings", label: "My meetings", icon: Video },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/room", label: "Meeting room", icon: MessagesSquare },
];
const tools = [
  { to: "/summaries", label: "AI summaries", icon: Sparkles },
  { to: "/recordings", label: "Recordings", icon: PlayCircle },
  { to: "/settings", label: "Settings", icon: Settings },
];

const getInitial = (value) => {
  const label = String(value || "User").trim();
  return label ? label.charAt(0).toUpperCase() : "U";
};

const getAvatarTone = (value) => {
  const tones = [
    "bg-brand text-white",
    "bg-violet-500 text-white",
    "bg-cyan-500 text-white",
    "bg-emerald-500 text-white",
    "bg-amber-500 text-slate-900",
    "bg-pink-500 text-white",
  ];
  const index = value?.toLowerCase().charCodeAt(0) % tones.length || 0;
  return tones[index];
};

function Item({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? "bg-white/10 text-white"
            : "text-white/60 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon size={18} /> {label}
    </NavLink>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const crumb = pathname.split("/")[1] || "dashboard";
  const close = () => setOpen(false);

  const displayName = user?.name || user?.fullname || user?.username || "User";
  const avatarTone = getAvatarTone(displayName);
  const avatarLetter = getInitial(displayName);
  const avatarSrc = user?.avatar || user?.picture || "";

  const avatarNode = avatarSrc ? (
    <img
      src={avatarSrc}
      alt={displayName}
      className="h-9 w-9 rounded-full object-cover"
      referrerPolicy="no-referrer"
    />
  ) : (
    <div
      className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${avatarTone}`}
      aria-label={`${displayName} avatar`}
    >
      {avatarLetter}
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-rail p-4 transition-transform lg:static lg:w-auto lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-6 flex items-center justify-between px-2 pt-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-display text-xl font-bold text-white"
          >
            <AppLogo
              className="text-white"
              iconClassName="h-8 w-8"
              textClassName="text-white"
            />
          </Link>
          <button
            className="text-white lg:hidden"
            onClick={close}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>
        <Link
          to="/meetings?new=1"
          onClick={close}
          className="mb-5 flex items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          <Plus size={16} /> New meeting
        </Link>
        <nav className="space-y-1">
          {nav.map((n) => (
            <Item key={n.to} {...n} onClick={close} />
          ))}
        </nav>
        <p className="mb-2 mt-6 px-3 text-xs text-white/40">Tools</p>
        <nav className="space-y-1">
          {tools.map((n) => (
            <Item key={n.to} {...n} onClick={close} />
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t border-white/10 px-2 pt-4">
          {avatarNode}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {displayName}
            </p>
            <p className="truncate text-xs text-white/50">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            aria-label="Log out"
            className="text-white/60 hover:text-white"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={close}
        />
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-bg/90 px-5 backdrop-blur lg:px-8">
          <button
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>
          <span className="text-sm capitalize text-muted">{crumb}</span>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
