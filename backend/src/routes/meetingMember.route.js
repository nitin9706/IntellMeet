import { Router } from "express";
import {
  joinMeeting,
  acceptInvitation,
  getMeetingMembers,
} from "../controllers/meetingMember.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/:meetingId/join", joinMeeting);
router.post("/:meetingId/accept-invite", acceptInvitation);
router.get("/:meetingId/members", getMeetingMembers);

export default router;
