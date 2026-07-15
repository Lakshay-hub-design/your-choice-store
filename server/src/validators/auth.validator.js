import { email, z } from "zod";

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

    password: z.string().min(8, "Password is required"),
  }),
});

export const resendVerificationEmailSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email address").toLowerCase(),
  }),
});
