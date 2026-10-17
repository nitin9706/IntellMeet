import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: [true, "Meeting is required"],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    senderName: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "system"],
      default: "text",
    },
    content: {
      type: String,
      default: "",
    },
    editedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    clientMessageId: {
      type: String,
      default: null,
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

export const Message = mongoose.model("Message", messageSchema);
