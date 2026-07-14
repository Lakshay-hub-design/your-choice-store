import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3, "Product name must be at least 3 characters").max(150),
    shortDescription: z.string().trim().max(250).optional().or(z.literal("")),
    description: z.string().trim().min(10, "Description should be at least 10 characters"),
    category: z.string().trim(),
    sku: z.string().trim().min(3).max(50),
    price: z.coerce.number().min(0),
    comparePrice: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().int().min(0),
    lowStockThreshold: z.coerce.number().int().min(0).optional(),
    isFeatured: z.coerce.boolean().optional(),
    isBestSeller: z.coerce.boolean().optional(),
    tags: z.union([z.array(z.string()), z.string()]),
    customization: z
      .object({
        enabled: z.coerce.boolean().optional(),
        allowText: z.coerce.boolean().optional(),
        allowImage: z.coerce.boolean().optional(),
        maxImages: z.coerce.number().optional(),
        instructions: z.string().optional(),
      })
      .optional(),
  }),
});
