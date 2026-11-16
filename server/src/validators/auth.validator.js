import { z } from "zod";

const phoneRegex = /^[6-9]\d{9}$/;

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(50),

    email: z.string().trim().email("Invalid email address").toLowerCase(),

    password: z.string().min(8, "Password must be at least 8 characters").max(50),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().trim().min(1, "Email or phone is required"),

    password: z.string().min(1, "Password is required"),
  }),
});

export const resendVerificationEmailSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email address").toLowerCase(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email address").toLowerCase(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),

    password: z.string().min(8, "Password must be at least 8 characters").max(50),
  }),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      fullName: z.string().trim().min(2).max(50).optional(),

      phone: z
        .union([
          z.literal(""),
          z.string().regex(phoneRegex, "Enter a valid 10-digit Indian mobile number"),
        ])
        .optional(),

      removeAvatar: z.enum(["true"]).optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "Please provide at least one profile field to update"
    ),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password cannot exceed 50 characters"),
  }),
});
