import { Invitation } from "../../models/invitations.model.js";
import { Meeting } from "../../models/meetings.model.js";
import { MeetingParticipant } from "../../models/meetingParticipants.model.js";
import { User } from "../../models/user.model.js";

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
