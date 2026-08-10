import { z } from "zod";

export const placeOrderSchema = z.object({
  body: z.object({
    addressId: z.string().trim().min(1, "Address is required"),

    paymentMethod: z.enum(["COD", "ONLINE"], {
      message: "Invalid payment method.",
    }),
  }),
});

export const cancelOrderSchema = z.object({
  body: z.object({
    reason: z
      .string()
      .trim()
      .max(500, "Cancellation reason cannot exceed 500 characters")
      .optional()
      .default(""),
  }),
});
