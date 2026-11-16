import express from "express";
import validate from "../middlewares/validate.js";
import {
  registerCustomer,
  verifyEmail,
  resendVerificationEmail,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
} from "../controllers/auth.controller.js";

import {
  registerSchema,
  loginSchema,
  resendVerificationEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";
import authenticate from "../middlewares/authenticate.js";

import { avatarUpload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerCustomer);

router.get("/verify-email", verifyEmail);

router.post(
  "/resend-verification-email",
  validate(resendVerificationEmailSchema),
  resendVerificationEmail
);

router.post("/login", validate(loginSchema), login);

router.post("/refresh-token", refreshToken);

router.post("/logout", logout);

router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);

router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

router.patch("/change-password", authenticate, validate(changePasswordSchema), changePassword);

router.get("/me", authenticate, getCurrentUser);

router.patch(
  "/profile",
  authenticate,
  avatarUpload.single("avatar"),
  validate(updateProfileSchema),
  updateProfile
);

export default router;
