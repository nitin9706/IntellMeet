import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import {
  accessCookieOptions,
  refreshCookieOptions,
  cookieOptions,
} from "../utils/cookieOptions.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body ?? {};

  // 1. Validate input types
  if (
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof fullname !== "string" ||
    typeof password !== "string"
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 2. Normalize input
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedFullname = fullname.trim();

  if (
    !normalizedUsername ||
    !normalizedEmail ||
    !normalizedFullname ||
    !password.trim()
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 3. Validate lengths
  if (normalizedUsername.length < 3 || normalizedUsername.length > 30) {
    throw new ApiError(400, "Username must be between 3 and 30 characters");
  }

  if (normalizedFullname.length < 2 || normalizedFullname.length > 50) {
    throw new ApiError(400, "Full name must be between 2 and 50 characters");
  }

  if (normalizedEmail.length > 254) {
    throw new ApiError(400, "Email address is too long");
  }

  if (password.length < 8 || password.length > 128) {
    throw new ApiError(400, "Password must be between 8 and 128 characters");
  }

  // 4. Check whether username or email already exists
  const existingUser = await User.findOne({
    $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
  });

  if (existingUser) {
    throw new ApiError(409, "Username or email already exists");
  }

  // 5. Create user
  // The User model should hash the password before saving.
  const user = await User.create({
    username: normalizedUsername,
    email: normalizedEmail,
    fullname: normalizedFullname,
    password,
  });

  // 6. Fetch the safe user document
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Unable to retrieve the registered user");
  }

  // 7. Return response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body ?? {};

  if (typeof password !== "string" || !password) {
    throw new ApiError(400, "Password is required");
  }

  if (password.length > 128) {
    throw new ApiError(400, "Invalid credentials");
  }

  if (
    (!username || typeof username !== "string") &&
    (!email || typeof email !== "string")
  ) {
    throw new ApiError(400, "Username or email is required");
  }

  const conditions = [];

  if (typeof username === "string" && username.trim()) {
    conditions.push({ username: username.trim().toLowerCase() });
  }

  if (typeof email === "string" && email.trim()) {
    conditions.push({ email: email.trim().toLowerCase() });
  }

  const user = await User.findOne({
    $or: conditions,
  }).select("+password");

  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid username/email or password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessCookieOptions)
    .cookie("refreshToken", refreshToken, refreshCookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser },
        "User logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 },
  });

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (typeof incomingRefreshToken !== "string" || !incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decodedToken._id);

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is invalid or has been revoked");
  }

  // Rotate the refresh token and issue a new access token.
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessCookieOptions)
    .cookie("refreshToken", refreshToken, refreshCookieOptions)
    .json(new ApiResponse(200, {}, "Access token refreshed successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body ?? {};

  if (
    typeof oldPassword !== "string" ||
    typeof newPassword !== "string" ||
    !oldPassword ||
    !newPassword
  ) {
    throw new ApiError(400, "Both passwords are required");
  }

  if (newPassword.length < 8 || newPassword.length > 128) {
    throw new ApiError(400, "New password must be 8–128 characters");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(
      400,
      "New password must be different from the old password",
    );
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect");
  }

  user.password = newPassword;
  user.refreshToken = undefined;

  await user.save();

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(
      new ApiResponse(
        200,
        {},
        "Password changed successfully. Please log in again.",
      ),
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(200, req.user, "current fetched user");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body ?? {};

  if (
    typeof fullname !== "string" ||
    typeof email !== "string" ||
    !fullname.trim() ||
    !email.trim()
  ) {
    throw new ApiError(400, "Full name and email are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: req.user._id },
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already in use");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullname: fullname.trim(),
        email: normalizedEmail,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
};
