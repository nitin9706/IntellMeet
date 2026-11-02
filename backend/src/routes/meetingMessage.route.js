import { Router } from "express";
import {
  createMeetingMessage,
  fetchMeetingMessages,
  fetchMeetingEvents,
} from "../controllers/meetingMessage.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/:meetingId/messages", createMeetingMessage);
router.get("/:meetingId/messages", fetchMeetingMessages);
router.get("/:meetingId/events", fetchMeetingEvents);

export default router;
