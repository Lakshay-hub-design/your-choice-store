import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5),

    title: z.string().trim().max(120).optional().or(z.literal("")),

    comment: z.string().trim().min(5, "Review is too short").max(2000),

    orderId: z.string().trim(),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5).optional(),

    title: z.string().trim().max(120).optional(),

    comment: z.string().trim().max(2000).optional(),

    keepImages: z.union([z.array(z.string()), z.string()]).optional(),
  }),
});
