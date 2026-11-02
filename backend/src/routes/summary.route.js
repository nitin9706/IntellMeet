import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

router.use(verifyJWT);

router.post("/", async (req, res) => {
  const transcript = req.body?.transcript;

  if (typeof transcript !== "string" || !transcript.trim()) {
    throw new ApiError(400, "Transcript is required");
  }

  const sanitized = transcript.trim();
  const sentences = sanitized.split(/(?<=[.!?])\s+/).filter(Boolean);
  const summary = [
    "Meeting Summary:",
    sentences[0] || sanitized.slice(0, 180),
    "",
    "Key discussion points:",
    sentences.slice(1, 3).join(" ") ||
      "No major discussion points were highlighted.",
    "",
    "Action items:",
    "- Follow up on agreed next steps.",
    "- Confirm ownership for each action item.",
    "- Share final notes with the group.",
  ].join("\n");

  return res
    .status(200)
    .json(new ApiResponse(200, { summary }, "Summary generated successfully"));
});

export default router;
