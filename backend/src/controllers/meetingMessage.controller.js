import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  sendMeetingMessage,
  getMeetingMessages,
  getMeetingEvents,
} from "../services/meeting.service.js";

const createMeetingMessage = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const { content, type, clientMessageId } = req.body ?? {};
  const userId = req.user?._id;

  if (!meetingId) {
    throw new ApiError(400, "Meeting ID is required");
  }

  if (typeof content !== "string" || !content.trim()) {
    throw new ApiError(400, "Message content is required");
  }

  const result = await sendMeetingMessage({
    meetingId,
    userId,
    content,
    type,
    clientMessageId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Message sent successfully"));
});

const fetchMeetingMessages = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const userId = req.user?._id;

  if (!meetingId) {
    throw new ApiError(400, "Meeting ID is required");
  }

  const result = await getMeetingMessages({ meetingId, userId });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Messages fetched successfully"));
});

const fetchMeetingEvents = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const userId = req.user?._id;

  if (!meetingId) {
    throw new ApiError(400, "Meeting ID is required");
  }

  const result = await getMeetingEvents({ meetingId, userId });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Meeting events fetched successfully"));
});

export { createMeetingMessage, fetchMeetingMessages, fetchMeetingEvents };
