import { Meeting } from "../models/meetings.model.js";
import { MeetingParticipant } from "../models/meetingParticipants.model.js";
import { Invitation } from "../models/invitations.model.js";
import { User } from "../models/user.model.js";
import { generateMeetingCode } from "../utils/generateMeetingCode.js";

const normalizeText = (value, fallback = "") => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

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

export const inviteUsersToMeeting = async ({
  meetingId,
  inviterId,
  emails,
}) => {
  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  if (String(meeting.hostId) !== String(inviterId)) {
    throw new Error("Only the host can send invitations");
  }

  const cleanedEmails = [
    ...new Set(
      emails
        .map((email) =>
          typeof email === "string" ? email.trim().toLowerCase() : "",
        )
        .filter(Boolean),
    ),
  ];

  if (!cleanedEmails.length) {
    throw new Error("No valid emails provided");
  }

  const createdInvitations = [];

  for (const email of cleanedEmails) {
    const existingInvitation = await Invitation.findOne({
      meetingId,
      inviteeEmail: email,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingInvitation) {
      continue;
    }

    const invitedUser = await User.findOne({ email });
    const inviteToken = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const invitation = await Invitation.create({
      meetingId,
      inviterId,
      inviteeEmail: email,
      tokenHash: inviteToken,
      status: "pending",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    createdInvitations.push({
      invitationId: invitation._id,
      email,
      invitedUserId: invitedUser ? invitedUser._id : null,
      status: invitation.status,
    });

    if (invitedUser) {
      const existingParticipant = await MeetingParticipant.findOne({
        meetingId,
        userId: invitedUser._id,
      });

      if (!existingParticipant) {
        await MeetingParticipant.create({
          meetingId,
          userId: invitedUser._id,
          displayName: invitedUser.name || invitedUser.fullname || "Guest",
          role: "participant",
          status: "invited",
        });
      }
    }
  }

  return createdInvitations;
};

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
