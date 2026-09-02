import { z } from "zod";

export const approveReturnSchema = z.object({
  body: z.object({
    adminNote: z
      .string()
      .trim()
      .max(2000, "Admin note cannot exceed 2000 characters")
      .optional()
      .default(""),
  }),
});

export const rejectReturnSchema = z.object({
  body: z.object({
    adminNote: z
      .string()
      .trim()
      .min(5, "Rejection reason must be at least 5 characters")
      .max(2000, "Rejection reason cannot exceed 2000 characters"),
  }),
});
