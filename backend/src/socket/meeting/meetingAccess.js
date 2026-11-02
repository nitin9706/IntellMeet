import { Meeting } from "../../models/meetings.model.js";
import { MeetingParticipant } from "../../models/meetingParticipants.model.js";

export async function authorizeMeeting({ meetingId, userId }) {
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
