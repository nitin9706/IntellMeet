import { Router } from "express";
import { createMeetingInvitations } from "../controllers/meetingInvitation.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/:meetingId/invite", createMeetingInvitations);

export default router;
