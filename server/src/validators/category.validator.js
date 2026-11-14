import { z } from "zod";

const booleanField = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  if (value === "true") return true;
  if (value === "false") return false;

  return value;
}, z.boolean().optional());

const displayOrderField = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  return value;
}, z.coerce.number().int().min(0).optional());

const seoSchema = z
  .object({
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
    keywords: z.array(z.string().trim().max(100)).max(20).optional(),
  })
  .strict();

const seoField = z.preprocess((value, ctx) => {
  if (value === undefined || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "Invalid SEO JSON format",
      });

      return z.NEVER;
    }
  }

  return value;
}, seoSchema.optional());

const parentCategoryField = z.preprocess(
  (value) => {
    if (value === "" || value === "null") return null;
    return value;
  },
  z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent category ID")
    .nullable()
    .optional()
);

const categoryFields = {
  name: z.string().trim().min(2).max(100),
  description: z.string().max(500),
  parentCategory: parentCategoryField,
  seo: seoField,
  isFeatured: booleanField,
  displayOrder: displayOrderField,
};

export const createCategorySchema = z.object({
  body: z
    .object({
      ...categoryFields,
      name: categoryFields.name,
    })
    .extend({
      name: z
        .string()
        .trim()
        .min(2, "Category name must be at least 2 characters")
        .max(100, "Category name cannot exceed 100 characters"),
    }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),
  }),

  body: z
    .object({
      name: categoryFields.name.optional(),
      description: categoryFields.description.optional(),
      parentCategory: categoryFields.parentCategory,
      seo: categoryFields.seo,
      isFeatured: categoryFields.isFeatured,
      isActive: booleanField,
      displayOrder: categoryFields.displayOrder,
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, "At least one field must be provided"),
});
