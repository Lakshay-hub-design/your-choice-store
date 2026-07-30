import { z } from "zod";

const parseJSON = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const booleanFromFormData = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;

  return value;
}, z.boolean());

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3, "Product name must be at least 3 characters").max(150),

    shortDescription: z.string().trim().max(250).optional().or(z.literal("")),

    description: z.string().trim().min(10, "Description should be at least 10 characters"),

    category: z.string().trim().min(1, "Category is required"),

    sku: z.string().trim().min(3).max(50),

    price: z.coerce.number().min(0),

    comparePrice: z.coerce.number().min(0).optional(),

    stock: z.coerce.number().int().min(0),

    lowStockThreshold: z.coerce.number().int().min(0).optional(),

    isFeatured: booleanFromFormData.optional(),

    isBestSeller: booleanFromFormData.optional(),

    isActive: booleanFromFormData.optional(),

    tags: z.preprocess(parseJSON, z.array(z.string().trim()).default([])),

    customization: z.preprocess(
      parseJSON,

      z
        .object({
          enabled: booleanFromFormData.optional(),

          allowText: booleanFromFormData.optional(),

          allowImage: booleanFromFormData.optional(),

          maxImages: z.coerce.number().int().min(1).optional(),

          instructions: z.string().trim().optional(),
        })
        .optional()
    ),
  }),
});

export const updateProductSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(3, "Product name must be at least 3 characters")
        .max(150)
        .optional(),

      shortDescription: z.string().trim().max(250).optional(),

      description: z
        .string()
        .trim()
        .min(10, "Description should be at least 10 characters")
        .optional(),

      category: z.string().trim().min(1, "Category is required").optional(),

      sku: z.string().trim().min(3, "SKU must be at least 3 characters").max(50).optional(),

      price: z.coerce.number().min(0, "Price cannot be negative").optional(),

      comparePrice: z.coerce.number().min(0, "Compare price cannot be negative").optional(),

      stock: z.coerce.number().int().min(0, "Stock cannot be negative").optional(),

      lowStockThreshold: z.coerce
        .number()
        .int()
        .min(0, "Low stock threshold cannot be negative")
        .optional(),

      isFeatured: booleanFromFormData.optional(),

      isBestSeller: booleanFromFormData.optional(),

      isActive: booleanFromFormData.optional(),

      tags: z.preprocess(parseJSON, z.array(z.string().trim()).optional()),

      customization: z.preprocess(
        parseJSON,
        z
          .object({
            enabled: booleanFromFormData.optional(),

            allowText: booleanFromFormData.optional(),

            allowImage: booleanFromFormData.optional(),

            maxImages: z.coerce.number().int().min(1).optional(),

            instructions: z.string().trim().optional(),
          })
          .optional()
      ),

      /*
       * IDs of existing images that
       * the admin wants to remove.
       */
      removedImages: z.preprocess(parseJSON, z.array(z.string()).default([])),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),

  params: z.object({
    id: z.string().trim().min(1, "Product ID is required"),
  }),
});

export const updateProductStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),

  params: z.object({
    id: z.string().trim().min(1, "Product ID is required"),
  }),
});
