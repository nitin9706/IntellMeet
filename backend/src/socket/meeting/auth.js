import jwt from "jsonwebtoken";
import { User } from "../../models/user.model.js";

const getAccessTokenSecret = () =>
  process.env.ACCESS_TOKEN_SECRET || process.env.JWT_ACCESS_SECRET;

export async function verifySocketToken(token) {
  const sanitized = String(token || "").trim();
  if (!sanitized) {
    throw new Error("Missing token");
  }

  const accessSecret = getAccessTokenSecret();
  if (!accessSecret) {
    throw new Error("JWT secret is not configured");
  }

  const decodedToken = jwt.verify(
    sanitized.replace(/^Bearer\s+/i, ""),
    accessSecret,
  );

  const user = await User.findById(
    decodedToken?._id || decodedToken?.id,
  ).select("-password -refreshToken");

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: String(user._id),
    name: user.name || user.fullname || user.username || "Participant",
    fullname: user.fullname,
    username: user.username,
  };
}
