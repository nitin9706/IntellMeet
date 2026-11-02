import { Router } from "express";
import { Recording } from "../models/recording.model.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

router.use(verifyJWT);

router.get("/my", async (req, res) => {
  const recordings = await Recording.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, recordings, "Recordings fetched successfully"));
});

export default router;
