import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  joinMeetingForUser,
  acceptMeetingInvitation,
  getMeetingParticipants,
} from "../services/meeting.service.js";

const joinMeeting = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const userId = req.user?._id;

  if (!meetingId) {
    throw new ApiError(400, "Meeting ID is required");
  }

  const participant = await joinMeetingForUser({ meetingId, userId });

  return res
    .status(200)
    .json(new ApiResponse(200, participant, "Joined meeting successfully"));
});

const acceptInvitation = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const { token } = req.body ?? {};
  const userId = req.user?._id;

  if (!meetingId) {
    throw new ApiError(400, "Meeting ID is required");
  }

  const result = await acceptMeetingInvitation({
    meetingId,
    userId,
    invitationToken: token,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Meeting invitation accepted successfully"),
    );
});

const getMeetingMembers = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const userId = req.user?._id;

  if (!meetingId) {
    throw new ApiError(400, "Meeting ID is required");
  }

  const result = await getMeetingParticipants({ meetingId, userId });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Meeting members fetched successfully"));
});

export { joinMeeting, acceptInvitation, getMeetingMembers };
