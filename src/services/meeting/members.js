import { Invitation } from "../../models/invitations.model.js";
import { Meeting } from "../../models/meetings.model.js";
import { MeetingEvent } from "../../models/meetingEvents.model.js";
import { MeetingParticipant } from "../../models/meetingParticipants.model.js";
import { User } from "../../models/user.model.js";
import { ensureMeetingMember } from "./helpers.js";

export const joinMeetingForUser = async ({ meetingId, userId }) => {
  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const existingParticipant = await MeetingParticipant.findOne({
    meetingId,
    userId,
  });

  if (existingParticipant) {
    if (existingParticipant.status !== "joined") {
      existingParticipant.status = "joined";
      existingParticipant.joinedAt = new Date();
      existingParticipant.joinCount += 1;
      await existingParticipant.save();
    }

    await MeetingEvent.create({
      meetingId,
      actorId: userId,
      type: "member_joined",
      metadata: { source: "existing-participant" },
    });

    return existingParticipant;
  }

  const participant = await MeetingParticipant.create({
    meetingId,
    userId,
    displayName: user.name || user.fullname || "Guest",
    role: "participant",
    status: "joined",
    joinedAt: new Date(),
    joinCount: 1,
  });

  await MeetingEvent.create({
    meetingId,
    actorId: userId,
    type: "member_joined",
    metadata: { source: "direct-join" },
  });

  return participant;
};

export const acceptMeetingInvitation = async ({
  meetingId,
  userId,
  invitationToken,
}) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const invitation = await Invitation.findOne({
    meetingId,
    inviteeEmail: user.email,
    status: "pending",
    ...(invitationToken ? { tokenHash: invitationToken } : {}),
  });

  if (!invitation) {
    throw new Error("No pending invitation found for this user");
  }

  const participant = await MeetingParticipant.findOne({
    meetingId,
    userId,
  });

  if (participant) {
    participant.status = "joined";
    participant.role = participant.role || "participant";
    participant.joinedAt = participant.joinedAt || new Date();
    participant.joinCount = Number(participant.joinCount || 0) + 1;
    await participant.save();
  } else {
    await MeetingParticipant.create({
      meetingId,
      userId,
      displayName: user.name || user.fullname || "Guest",
      role: "participant",
      status: "joined",
      joinedAt: new Date(),
      joinCount: 1,
    });
  }

  invitation.status = "accepted";
  invitation.acceptedAt = new Date();
  await invitation.save();

  await MeetingEvent.create({
    meetingId,
    actorId: userId,
    type: "invitation_accepted",
    metadata: { invitationId: invitation._id },
  });

  return {
    invitation,
    participant: await MeetingParticipant.findOne({ meetingId, userId }),
  };
};

export const getMeetingParticipants = async ({ meetingId, userId }) => {
  const { meeting } = await ensureMeetingMember({ meetingId, userId });

  const participants = await MeetingParticipant.find({ meetingId })
    .populate("userId", "name fullname email avatar")
    .sort({ createdAt: 1 });

  return {
    meeting,
    participants,
  };
};
