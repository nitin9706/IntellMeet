import { Meeting } from "../../models/meetings.model.js";
import { MeetingParticipant } from "../../models/meetingParticipants.model.js";

export const normalizeText = (value, fallback = "") => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

export const ensureMeetingMember = async ({ meetingId, userId }) => {
  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  const isHost = String(meeting.hostId) === String(userId);
  const participant = await MeetingParticipant.findOne({ meetingId, userId });

  if (!isHost && !participant) {
    throw new Error("You are not allowed to access this meeting");
  }

  return { meeting, participant, isHost };
};
