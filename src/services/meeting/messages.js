import { MeetingEvent } from "../../models/meetingEvents.model.js";
import { Message } from "../../models/messages.model.js";
import { User } from "../../models/user.model.js";
import { ensureMeetingMember } from "./helpers.js";

export const sendMeetingMessage = async ({
  meetingId,
  userId,
  content,
  type = "text",
  clientMessageId,
}) => {
  const { meeting } = await ensureMeetingMember({ meetingId, userId });

  const sender = await User.findById(userId).select(
    "name fullname avatar email",
  );

  const message = await Message.create({
    meetingId,
    senderId: userId,
    senderName: sender?.name || sender?.fullname || "User",
    type: type === "system" ? "system" : "text",
    content: typeof content === "string" ? content : "",
    clientMessageId: clientMessageId || null,
  });

  await MeetingEvent.create({
    meetingId,
    actorId: userId,
    type: "message_sent",
    metadata: {
      messageId: message._id,
    },
  });

  return {
    meeting,
    message,
  };
};

export const getMeetingMessages = async ({ meetingId, userId }) => {
  const { meeting } = await ensureMeetingMember({ meetingId, userId });

  const messages = await Message.find({ meetingId })
    .populate("senderId", "name fullname avatar")
    .sort({ createdAt: 1 });

  return {
    meeting,
    messages,
  };
};

export const getMeetingEvents = async ({ meetingId, userId }) => {
  const { meeting } = await ensureMeetingMember({ meetingId, userId });

  const events = await MeetingEvent.find({ meetingId })
    .populate("actorId", "name fullname avatar")
    .sort({ occurredAt: 1 });

  return {
    meeting,
    events,
  };
};
