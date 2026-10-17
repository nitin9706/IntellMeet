import { Router } from "express";
import {
  createMeeting,
  getMeetingById,
  getMyMeetings,
  updateMeetingStatus,
} from "../controllers/meeting.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/create", createMeeting);
router.get("/my", getMyMeetings);
router.get("/:meetingId", getMeetingById);
router.patch("/:meetingId/status", updateMeetingStatus);

export default router;
