import { Meeting } from "../../models/meetings.model.js";
import { MeetingParticipant } from "../../models/meetingParticipants.model.js";
import { generateMeetingCode } from "../../utils/generateMeetingCode.js";
import { normalizeText } from "./helpers.js";

export const createMeetingWithHost = async ({ userId, meetingData = {} }) => {
  const roomName = normalizeText(meetingData.roomName, "");
  const title = normalizeText(
    meetingData.title,
    roomName || "Untitled meeting",
  );
  const description = normalizeText(meetingData.description, "");

  if (!roomName) {
    throw new Error("Room name is required");
  }

  if (roomName.length < 3 || roomName.length > 80) {
    throw new Error("Room name must be between 3 and 80 characters");
  }

  let meetingCode = generateMeetingCode();
  while (await Meeting.exists({ meetingCode })) {
    meetingCode = generateMeetingCode();
  }

  const meeting = await Meeting.create({
    roomName,
    meetingCode,
    hostId: userId,
    title,
    description,
    status: "scheduled",
    scheduledStartAt: meetingData.scheduledStartAt
      ? new Date(meetingData.scheduledStartAt)
      : null,
    settings:
      meetingData.settings && typeof meetingData.settings === "object"
        ? meetingData.settings
        : {},
  });

  await MeetingParticipant.create({
    meetingId: meeting._id,
    userId,
    displayName: meetingData.hostName || "Host",
    role: "host",
    status: "joined",
    joinedAt: new Date(),
  });

  return meeting;
};
