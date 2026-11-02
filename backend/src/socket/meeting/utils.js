export const roomKey = (meetingId) => `meeting:${meetingId}`;

export const normalizeMeetingId = (meetingId) => {
  if (!meetingId || typeof meetingId !== "string") return "";
  const value = meetingId.trim();
  return value.length > 0 && value.length <= 128 ? value : "";
};

export const parseCookies = (cookieHeader = "") => {
  const cookies = {};
  for (const part of String(cookieHeader).split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    cookies[key] = decodeURIComponent(value);
  }
  return cookies;
};

export const getParticipantSnapshot = (members = new Map()) =>
  [...members.entries()].map(([socketId, member]) => ({
    socketId,
    userId: member.userId,
    name: member.name,
    micOn: Boolean(member.micOn),
    cameraOn: Boolean(member.cameraOn),
    isHost: Boolean(member.isHost),
    connected: Boolean(member.connected),
  }));

export const isHostActionAllowed = (meeting, userId) =>
  String(meeting.hostId) === String(userId);
