import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),

  email: z.string().trim().email("Enter a valid email address"),

  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^[6-9]\d{9}$/.test(value),
      "Enter a valid 10-digit mobile number"
    ),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password is too long"),

  terms: z.literal(true, {
    error: "You must agree to the Terms and Privacy Policy",
  }),
});
