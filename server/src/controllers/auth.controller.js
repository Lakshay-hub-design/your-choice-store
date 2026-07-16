import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import authService from "../services/auth.service.js";
import { refreshTokenCookieOptions } from "../utils/cookieOptions.js";

const registerCustomer = asyncHandler(async (req, res) => {
  const result = await authService.registerCustomer(req.body);

  return res.status(201).json(new ApiResponse(201, result.message, null));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  const result = await authService.verifyEmail(token);

  return res.status(200).json(new ApiResponse(200, result.message, null));
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.resendVerificationEmail(email);

  return res.status(200).json(new ApiResponse(200, result.message, null));
});

const login = asyncHandler(async (req, res) => {
  const { user, refreshToken, accessToken } = await authService.login(req.body);

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  return res.status(200).json(
    new ApiResponse(200, "Login successful", {
      user,
      accessToken,
    })
  );
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(token);

  res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

  return res.status(200).json(
    new ApiResponse(200, "Token refreshed", {
      accessToken,
    })
  );
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  await authService.logout(token);

  res.clearCookie("refreshToken");

  return res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  return res.status(200).json(new ApiResponse(200, "Current user fetched successfully", user));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);

  return res.status(200).json(new ApiResponse(200, result.message, null));
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);

  return res.status(200).json(new ApiResponse(200, result.message, null));
});

export {
  registerCustomer,
  verifyEmail,
  resendVerificationEmail,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};
