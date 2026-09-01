import { z } from "zod";

export const createReturnRequestSchema = z.object({
  body: z.object({
    orderId: z.string().trim().min(1, "Order ID is required"),

    items: z
      .array(
        z.object({
          productId: z.string().trim().min(1, "Product ID is required"),

          quantity: z
            .number({
              error: "Quantity must be a number",
            })
            .int("Quantity must be a whole number")
            .min(1, "Quantity must be at least 1"),
        })
      )
      .min(1, "At least one item is required"),

    reason: z.enum(
      ["DAMAGED", "WRONG_PRODUCT", "DEFECTIVE", "MISSING_ITEM", "NOT_AS_DESCRIBED", "OTHER"],
      {
        error: "Invalid return reason",
      }
    ),

    description: z
      .string()
      .trim()
      .min(10, "Please provide more details about the issue")
      .max(2000, "Description cannot exceed 2000 characters"),
  }),
});
