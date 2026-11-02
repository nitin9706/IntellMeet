import { Meeting } from "../../models/meetings.model.js";
import { MeetingParticipant } from "../../models/meetingParticipants.model.js";

export const getMeetingsForUser = async (userId) => {
  const participants = await MeetingParticipant.find({ userId }).select(
    "meetingId",
  );
  const meetingIds = participants.map((participant) => participant.meetingId);

  if (!meetingIds.length) return [];

  return Meeting.find({ _id: { $in: meetingIds } })
    .sort({ createdAt: -1 })
    .populate("hostId", "name email");
};

export const getMeetingForUser = async ({ meetingId, userId }) => {
  const meeting = await Meeting.findById(meetingId).populate(
    "hostId",
    "name email avatar",
  );

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  const isHost =
    meeting.hostId &&
    String(meeting.hostId._id || meeting.hostId) === String(userId);
  const participant = await MeetingParticipant.findOne({ meetingId, userId });

  if (!isHost && !participant) {
    throw new Error("You are not allowed to access this meeting");
  }

  return meeting;
};

export const updateMeetingStatusForUser = async ({
  meetingId,
  userId,
  status,
}) => {
  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  if (String(meeting.hostId) !== String(userId)) {
    throw new Error("Only the host can update meeting status");
  }

  const allowedStatuses = ["scheduled", "active", "ended"];
  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid meeting status");
  }

  meeting.status = status;

  if (status === "active" && !meeting.startedAt) {
    meeting.startedAt = new Date();
  }

  if (status === "ended" && !meeting.endedAt) {
    meeting.endedAt = new Date();
  }

  await meeting.save();
  return meeting;
};
