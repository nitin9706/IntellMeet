import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import meetingRouter from "./routes/meeting.route.js";
import meetingInvitationRouter from "./routes/meetingInvitation.route.js";
import meetingMemberRouter from "./routes/meetingMember.route.js";
import meetingMessageRouter from "./routes/meetingMessage.route.js";
import userRouter from "./routes/user.route.js";
import recordingRouter from "./routes/recording.route.js";
import summaryRouter from "./routes/summary.route.js";

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
  }),
);

app.use("/api/users", userRouter);
app.use("/api/meetings", meetingRouter);
app.use("/api/meetings", meetingInvitationRouter);
app.use("/api/meetings", meetingMemberRouter);
app.use("/api/meetings", meetingMessageRouter);
app.use("/api/recordings", recordingRouter);
app.use("/api/summaries", summaryRouter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Meet backend is running",
  });
});

export default app;
