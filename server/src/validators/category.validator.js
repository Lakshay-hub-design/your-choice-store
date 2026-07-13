import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Category name must be at least 2 characters").max(100),

    description: z.string().max(500).optional(),

    isFeatured: z.coerce.boolean().optional(),

    displayOrder: z.coerce.number().optional(),
  }),
});
