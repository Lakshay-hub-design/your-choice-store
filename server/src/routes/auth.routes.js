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
} from "../controllers/auth.controller.js";

import {
  registerSchema,
  loginSchema,
  resendVerificationEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import authenticate from "../middlewares/authenticate.js";

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

router.get("/me", authenticate, getCurrentUser);

export default router;
