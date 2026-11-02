import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Clock,
  Sparkles,
  Users,
  Video,
  DoorOpen,
} from "lucide-react";
import { api } from "../lib/api";
import useFetch from "../hooks/useFetch";
import { getStart, getStatus, sameDay } from "../lib/meetings";
import { useAuth } from "../context/AuthContext";
import {
  Button,
  Empty,
  ErrorBanner,
  PageHeader,
  Panel,
  Stat,
  StatusBadge,
} from "../components/ui";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: meetings, error, reload } = useFetch(api.meetings);
  const today = meetings.filter((m) => sameDay(getStart(m), new Date()));
  const hours = Math.round(
    meetings.reduce((s, m) => s + (m.duration || 60), 0) / 60,
  );
  const people = new Set(meetings.flatMap((m) => m.participants || [])).size;
  const upcoming = meetings
    .filter((m) => getStatus(m) !== "expired")
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Hi, ${user?.fullname?.split(" ")[0]}`}
        subtitle="Here is what is happening with your meetings today."
        action={
          <Link to="/meetings?new=1">
            <Button>New meeting</Button>
          </Link>
        }
      />
      <ErrorBanner message={error} onRetry={reload} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Meetings today"
          value={today.length}
          icon={CalendarCheck}
        />
        <Stat label="Scheduled hours" value={hours} icon={Clock} />
        <Stat label="AI summaries" value={0} icon={Sparkles} />
        <Stat label="Participants" value={people} icon={Users} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Panel
          title="Upcoming meetings"
          action={
            <Link to="/calendar" className="text-sm font-semibold text-brand">
              Open calendar
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <Empty
              icon={Video}
              title="No meetings scheduled"
              text="Schedule your first meeting and it will show up here."
              action={
                <Link to="/meetings?new=1">
                  <Button>Schedule a meeting</Button>
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map((m) => (
                <li
                  key={m._id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-semibold">{m.title}</p>
                    <p className="text-sm text-muted">
                      {getStart(m).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={getStatus(m)} />
                    <Link
                      to={`/room/${m._id}`}
                      className="text-sm font-semibold text-brand"
                    >
                      Join
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Quick actions">
          <div className="space-y-2">
            {[
              ["/meetings?new=1", Video, "Schedule a meeting"],
              ["/room", DoorOpen, "Join a meeting"],
              ["/summaries", Sparkles, "Summarize a transcript"],
            ].map(([to, Icon, label]) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-lg border border-line px-4 py-3 text-sm font-medium hover:bg-bg"
              >
                <Icon size={18} className="text-brand" /> {label}
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
