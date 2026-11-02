import jwt from "jsonwebtoken";
import { Meeting } from "../models/meetings.model.js";
import { MeetingParticipant } from "../models/meetingParticipants.model.js";
import { User } from "../models/user.model.js";
import { sendMeetingMessage } from "../services/meeting.service.js";

const roomMembers = new Map();
const roomKey = (meetingId) => `meeting:${meetingId}`;

const getAccessTokenSecret = () =>
  process.env.ACCESS_TOKEN_SECRET || process.env.JWT_ACCESS_SECRET;

const parseCookies = (cookieHeader = "") => {
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

const normalizeMeetingId = (meetingId) => {
  if (!meetingId || typeof meetingId !== "string") return "";
  const value = meetingId.trim();
  return value.length > 0 && value.length <= 128 ? value : "";
};

const getParticipantSnapshot = (members = new Map()) =>
  [...members.entries()].map(([socketId, member]) => ({
    socketId,
    userId: member.userId,
    name: member.name,
    micOn: Boolean(member.micOn),
    cameraOn: Boolean(member.cameraOn),
    isHost: Boolean(member.isHost),
    connected: Boolean(member.connected),
  }));

const isHostActionAllowed = (meeting, userId) =>
  String(meeting.hostId) === String(userId);

export { registerMeetingSocket } from "./meeting/index.js";

async function verifySocketToken(token) {
  const sanitized = String(token || "").trim();
  if (!sanitized) {
    throw new Error("Missing token");
  }

  const accessSecret = getAccessTokenSecret();
  if (!accessSecret) {
    throw new Error("JWT secret is not configured");
  }

  const decodedToken = jwt.verify(
    sanitized.replace(/^Bearer\s+/i, ""),
    accessSecret,
  );

  const user = await User.findById(
    decodedToken?._id || decodedToken?.id,
  ).select("-password -refreshToken");

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: String(user._id),
    name: user.name || user.fullname || user.username || "Participant",
    fullname: user.fullname,
    username: user.username,
  };
}

async function authorizeMeeting({ meetingId, userId }) {
  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    return { allowed: false, reason: "Meeting not found" };
  }

  const isHost = String(meeting.hostId) === String(userId);
  const participant = await MeetingParticipant.findOne({ meetingId, userId });

  if (meeting.status === "ended") {
    return { allowed: false, reason: "Meeting has ended" };
  }

  if (!isHost && !participant) {
    return { allowed: false, reason: "You are not a member of this meeting" };
  }

  return {
    allowed: true,
    isHost,
    participant,
    meeting,
  };
}
