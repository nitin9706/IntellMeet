import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Send,
} from "lucide-react";
import { api } from "../lib/api";
import useFetch from "../hooks/useFetch";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/ui";

export default function MeetingRoom() {
  const { meetingId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { data: meetings } = useFetch(api.meetings);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [camError, setCamError] = useState("");
  const [chatOpen, setChatOpen] = useState(true);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((s) => {
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() =>
        setCamError(
          "Camera or microphone access was blocked. Allow it in your browser settings.",
        ),
      );
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const toggle = (kind, on, set) => {
    streamRef.current?.[
      kind === "audio" ? "getAudioTracks" : "getVideoTracks"
    ]().forEach((t) => (t.enabled = !on));
    set(!on);
  };
  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setMsgs([...msgs, { from: user.name, text, at: new Date() }]);
    setText("");
  };
  const current = meetings.find((m) => m._id === meetingId);

  return (
    <>
      <PageHeader
        title={current?.title || "Meeting room"}
        subtitle={
          meetingId ? `Meeting ID ${meetingId}` : "Pick a meeting to join."
        }
        action={
          !meetingId && (
            <select
              onChange={(e) => e.target.value && nav(`/room/${e.target.value}`)}
              defaultValue=""
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm"
            >
              <option value="">Select meeting</option>
              {meetings.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title}
                </option>
              ))}
            </select>
          )
        }
      />
      <div
        className={`grid gap-4 ${chatOpen ? "lg:grid-cols-[1fr_320px]" : ""}`}
      >
        <div className="relative aspect-video overflow-hidden rounded-xl bg-rail">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`h-full w-full -scale-x-100 object-cover ${cam ? "" : "invisible"}`}
          />
          {(!cam || camError) && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center text-white/70">
              {camError || (
                <span className="grid h-24 w-24 place-items-center rounded-full bg-brand font-display text-4xl font-bold text-white">
                  {user.fullname[0]}
                </span>
              )}
            </div>
          )}
          <span className="absolute bottom-4 left-4 rounded-md bg-black/60 px-2.5 py-1 text-sm text-white">
            {user.fullname} (You)
          </span>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            <button
              aria-label="Toggle microphone"
              onClick={() => toggle("audio", mic, setMic)}
              className={`rounded-full p-3 text-white ${mic ? "bg-white/20" : "bg-danger"}`}
            >
              {mic ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button
              aria-label="Toggle camera"
              onClick={() => toggle("video", cam, setCam)}
              className={`rounded-full p-3 text-white ${cam ? "bg-white/20" : "bg-danger"}`}
            >
              {cam ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
            <button
              aria-label="Toggle chat"
              onClick={() => setChatOpen(!chatOpen)}
              className="rounded-full bg-white/20 p-3 text-white"
            >
              <MessageSquare size={18} />
            </button>
            <button
              aria-label="Leave meeting"
              onClick={() => nav("/meetings")}
              className="rounded-full bg-danger p-3 text-white"
            >
              <PhoneOff size={18} />
            </button>
          </div>
        </div>
        {chatOpen && (
          <aside className="flex h-96 flex-col rounded-xl border border-line bg-surface lg:h-auto">
            <h2 className="border-b border-line px-4 py-3 font-display font-bold">
              Meeting chat
            </h2>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgs.length === 0 && (
                <p className="text-sm text-muted">
                  No messages yet. Say hello.
                </p>
              )}
              {msgs.map((m, i) => (
                <div key={i}>
                  <p className="text-xs text-muted">
                    {m.from} ·{" "}
                    {m.at.toLocaleTimeString([], { timeStyle: "short" })}
                  </p>
                  <p className="text-sm">{m.text}</p>
                </div>
              ))}
            </div>
            <form
              onSubmit={send}
              className="flex gap-2 border-t border-line p-3"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a message"
                className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm"
              />
              <button
                aria-label="Send"
                className="rounded-lg bg-brand p-2.5 text-white"
              >
                <Send size={16} />
              </button>
            </form>
          </aside>
        )}
      </div>
    </>
  );
}
