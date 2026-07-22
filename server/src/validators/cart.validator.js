import { z } from "zod";

const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID");

export const addToCartSchema = z.object({
  body: z.object({
    productId: mongoIdSchema,

    quantity: z
      .number()
      .int("Quantity must be an integer")
      .min(1, "Quantity must be at least 1")
      .max(20, "Maximum quantity allowed is 20")
      .default(1),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .min(1, "Quantity must be at least 1")
      .max(20, "Maximum quantity allowed is 20"),
  }),

  params: z.object({
    productId: mongoIdSchema,
  }),
});

export const cartProductParamsSchema = z.object({
  params: z.object({
    productId: mongoIdSchema,
  }),
});
