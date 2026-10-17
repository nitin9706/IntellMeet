import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: [true, "Meeting is required"],
    },
    inviterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Inviter is required"],
    },
    inviteeEmail: {
      type: String,
      required: [true, "Invitee email is required"],
      trim: true,
      lowercase: true,
    },
    tokenHash: {
      type: String,
      required: [true, "Token hash is required"],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "expired"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    acceptedAt: {
      type: Date,
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

export const Invitation = mongoose.model("Invitation", invitationSchema);
