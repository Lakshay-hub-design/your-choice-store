import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.js";
import { generateRandomToken, hashToken } from "../utils/crypto.js";
import emailServce from "./email.service.js";

const findUserByEmail = async (email) => {
  return await User.findOne({
    email: email.toLowerCase(),
  }).select("+verificationToken +verificationTokenExpires +lastVerificationEmailSentAt");
};

const createVerificationToken = () => {
  const token = generateRandomToken();

  return {
    token,
    hashedToken: hashToken(token),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
};

const registerCustomer = async (userData) => {
  const { fullName, email, phone, password } = userData;

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  if (phone) {
    const existingPhone = await User.findOne({ phone });

    if (existingPhone) {
      throw new ApiError(409, "Phone number already registered");
    }
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const user = await User.create(
      [
        {
          fullName,
          email,
          phone,
          password,
          isVerified: false,
        },
      ],
      { session }
    );

    const createdUser = user[0];

    const { token, hashToken, expiresAt } = createVerificationToken();

    user.verificationToken = hashToken;
    user.verificationTokenExpires = expiresAt;
    user.lastVerificationEmailSentAt = new Date();

    await user.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  await emailServce.sendVerificationEmail(user, token);

  return {
    message: "Account created successfully. Please verify your email.",
  };
};

const verifyEmail = async (token) => {
  if (!token) {
    throw new ApiError(400, "Verification token is required");
  }

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    verificationToken: hashToken,
    verificationTokenExpires: {
      $gt: new Date(),
    },
  }).select("+verificationToken +verificationTokenExpires");

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification link");
  }

  user.isVerified = true;

  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;

  await user.save();

  return {
    message: "Email verified succesfully",
  };
};

const VERIFICATION_EMAIL_COOLDOWN = 30 * 1000;

const resendVerificationEmail = async (email) => {
  const user = findUserByEmail(email);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  if (
    user.lastVerificationEmailSentAt &&
    Date.now() - user.lastVerificationEmailSentAt.getTime() < VERIFICATION_EMAIL_COOLDOWN
  ) {
    const remainingTime = Math.ceil(
      (VERIFICATION_EMAIL_COOLDOWN - (Date.now() - user.lastVerificationEmailSentAt.getTime())) /
        1000
    );

    throw new ApiError(
      429,
      `Please wait ${remainingTime} seconds before requesting another verification email.`
    );
  }

  const { token, hashToken, expiresAt } = createVerificationToken();

  user.verificationToken = hashToken;
  user.verificationTokenExpires = expiresAt;
  user.lastVerificationEmailSentAt = new Date();

  await user.save();

  await emailServce.sendVerificationEmail(user, token);

  return {
    message: "Verification email sent succesfully",
  };
};

const login = async ({ identifier, password }) => {
  const query = identifier.includes("@")
    ? { email: identifier.toLowerCase() }
    : { phone: identifier };

  const user = await User.findOne(query).select("+password +refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email before logging in.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account has been disabled.");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const refreshToken = generateRefreshToken(user);
  const accessToken = generateAccessToken(user);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();

  await user.save();

  user.password = undefined;
  user.refreshTokenHash = undefined;

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const logout = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  const decoded = verifyRefreshToken(refreshToken);

  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user) {
    return;
  }

  user.refreshToken = undefined;

  await user.save();
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (refreshToken !== user.refreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const newRefreshToken = generateRefreshToken(user);
  const accessToken = generateAccessToken(user);

  user.refreshToken = newRefreshToken;

  await user.save();

  return {
    newRefreshToken,
    accessToken,
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const authService = {
  registerCustomer,
  verifyEmail,
  resendVerificationEmail,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
};

export default authService;
