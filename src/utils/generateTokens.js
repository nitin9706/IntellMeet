import { User } from "../models/user.model";
import jwt from "jsonwebtoken";

export const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const accessSecret = process.env.ACCESS_TOKEN_SECRET;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

  if (!accessSecret || !refreshSecret) {
    throw new Error("JWT secrets are not configured");
  }

  const accessToken = jwt.sign({ _id: user._id }, accessSecret, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ _id: user._id }, refreshSecret, {
    expiresIn: "7d",
  });

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};
