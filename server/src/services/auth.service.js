import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.js";
import { generateRandomToken, hashToken } from "../utils/crypto.js";
import emailService from "./email.service.js";
import logger from "../utils/logger.js";
import { uploadImage, deleteImages } from "../services/image.service.js";

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

  const { token, hashedToken, expiresAt } = createVerificationToken();

  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    isVerified: false,
    verificationToken: hashedToken,
    verificationTokenExpires: expiresAt,
    lastVerificationEmailSentAt: new Date(),
  });

  try {
    await emailService.sendVerificationEmail(user, token);
  } catch (error) {
    logger.error(`Failed to send verification email to ${user.email}:`, error);
  }

  return {
    message: "Account created successfully. Please check your email to verify your account.",
  };
};

const verifyEmail = async (token) => {
  if (!token) {
    throw new ApiError(400, "Verification token is required");
  }

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    verificationToken: hashedToken,
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
  const user = await findUserByEmail(email);

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

  const { token, hashedToken, expiresAt } = createVerificationToken();

  user.verificationToken = hashedToken;
  user.verificationTokenExpires = expiresAt;
  user.lastVerificationEmailSentAt = new Date();

  await user.save();

  await emailService.sendVerificationEmail(user, token);

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

const forgotPassword = async (email) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+passwordResetToken +passwordResetTokenExpires");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email first");
  }

  const token = generateRandomToken();

  user.passwordResetToken = hashToken(token);
  user.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  await emailService.sendPasswordResetEmail(user, token);

  return {
    message: "Password reset email sent successfully.",
  };
};

const resetPassword = async ({ token, password }) => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: {
      $gt: new Date(),
    },
  }).select("+password +passwordResetToken +passwordResetTokenExpires");

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.password = password;

  user.passwordChangedAt = new Date();

  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  user.refreshToken = "";

  await user.save();

  return {
    message: "Password reset successfully.",
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password +refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Supports future Google-only accounts.
  if (!user.password) {
    throw new ApiError(
      400,
      "This account does not have a password. Please use your connected sign-in method."
    );
  }

  const isPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  // Prevent using the existing password again.
  const isSamePassword = await user.comparePassword(newPassword);

  if (isSamePassword) {
    throw new ApiError(400, "Your new password must be different from your current password.");
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();

  // Invalidate the existing refresh token.
  user.refreshToken = "";

  await user.save();

  return {
    message: "Password changed successfully. Please log in again.",
  };
};

const updateProfile = async (userId, profileData, file) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { fullName, phone } = profileData;

  if (fullName !== undefined) {
    user.fullName = fullName;
  }

  if (phone !== undefined) {
    if (phone === "") {
      user.phone = undefined;
    } else {
      const existingPhone = await User.findOne({
        phone,
        _id: { $ne: userId },
      });

      if (existingPhone) {
        throw new ApiError(409, "Phone number already registered");
      }

      user.phone = phone;
    }
  }

  let uploadedImage = null;
  const oldFileId = user.avatar?.fileId;

  // Upload new profile picture if provided
  if (file) {
    uploadedImage = await uploadImage(file, "/avatars");

    user.avatar = {
      fileId: uploadedImage.fileId,
      url: uploadedImage.url,
    };
  }

  try {
    await user.save();
  } catch (error) {
    // Remove newly uploaded image if database save fails
    if (uploadedImage?.fileId) {
      await deleteImages([uploadedImage.fileId]);
    }

    throw error;
  }

  // Delete previous profile picture after successful save
  if (uploadedImage && oldFileId) {
    await deleteImages([oldFileId]);
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
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
};

export default authService;
