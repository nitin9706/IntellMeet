import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      required: [true, "Room name is required"],
      unique: true,
      trim: true,
    },
    meetingCode: {
      type: String,
      required: [true, "Meeting code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Host is required"],
    },
    title: {
      type: String,
      trim: true,
      default: "Untitled meeting",
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "ended"],
      default: "scheduled",
    },
    scheduledStartAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    settings: {
      type: Object,
      default: {},
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

export const Meeting = mongoose.model("Meeting", meetingSchema);
