import mongoose from "mongoose";

const meetingEventSchema = new mongoose.Schema(
  {
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: [true, "Meeting is required"],
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      required: [true, "Event type is required"],
      trim: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
    occurredAt: {
      type: Date,
      default: Date.now,
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

export const MeetingEvent = mongoose.model("MeetingEvent", meetingEventSchema);
