import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createMeetingWithHost,
  getMeetingsForUser,
  getMeetingForUser,
  updateMeetingStatusForUser,
} from "../services/meeting.service.js";

const createMeeting = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const body = req.body ?? {};

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const meeting = await createMeetingWithHost({
    userId,
    meetingData: {
      roomName: body.roomName,
      title: body.title,
      description: body.description,
      scheduledStartAt: body.scheduledStartAt,
      settings: body.settings,
      hostName: req.user?.name || req.user?.fullname || "Host",
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, meeting, "Meeting created successfully"));
});

const getMyMeetings = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const meetings = await getMeetingsForUser(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, meetings, "Meetings fetched successfully"));
});

const getMeetingById = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const userId = req.user?._id;

  if (!meetingId) {
    throw new ApiError(400, "Meeting ID is required");
  }

  const meeting = await getMeetingForUser({ meetingId, userId });

  return res
    .status(200)
    .json(new ApiResponse(200, meeting, "Meeting fetched successfully"));
});

const updateMeetingStatus = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const { status } = req.body ?? {};
  const userId = req.user?._id;

  if (!meetingId) {
    throw new ApiError(400, "Meeting ID is required");
  }

  if (!status) {
    throw new ApiError(400, "Meeting status is required");
  }

  const meeting = await updateMeetingStatusForUser({
    meetingId,
    userId,
    status,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, meeting, "Meeting status updated successfully"));
});

export { createMeeting, getMyMeetings, getMeetingById, updateMeetingStatus };
