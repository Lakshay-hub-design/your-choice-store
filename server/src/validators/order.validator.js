import { z } from "zod";

export const placeOrderSchema = z.object({
  body: z.object({
    addressId: z.string().trim().min(1, "Address is required"),

    paymentMethod: z.enum(["COD"]),
  }),
});
