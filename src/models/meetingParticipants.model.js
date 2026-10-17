import mongoose from "mongoose";

const meetingParticipantSchema = new mongoose.Schema(
  {
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: [true, "Meeting is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    guestId: {
      type: String,
      default: null,
    },
    displayName: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["host", "co-host", "participant", "guest"],
      default: "participant",
    },
    status: {
      type: String,
      enum: ["invited", "joined", "left"],
      default: "invited",
    },
    joinedAt: {
      type: Date,
      default: null,
    },
    leftAt: {
      type: Date,
      default: null,
    },
    totalDurationSeconds: {
      type: Number,
      default: 0,
    },
    joinCount: {
      type: Number,
      default: 0,
    },
    isMutedByHost: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const MeetingParticipant = mongoose.model(
  "MeetingParticipant",
  meetingParticipantSchema,
);
