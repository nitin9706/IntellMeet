import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { inviteUsersToMeeting } from "../services/meeting.service.js";

const createMeetingInvitations = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const { emails } = req.body ?? {};
  const userId = req.user?._id;

  if (!meetingId) {
    throw new ApiError(400, "Meeting ID is required");
  }

  if (!Array.isArray(emails) || !emails.length) {
    throw new ApiError(400, "At least one email is required");
  }

  const result = await inviteUsersToMeeting({
    meetingId,
    inviterId: userId,
    emails,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Meeting invitations sent successfully", result),
    );
});

export { createMeetingInvitations };
