import mongoose from "mongoose";

import Category from "../models/Category.js";
import Product from "../models/Product.js";

import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

import { uploadImage, deleteImage } from "./image.service.js";

// Escape special regex characters in user-provided search values.
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Convert MongoDB duplicate-key errors into useful API errors.
const handleDuplicateKeyError = (error) => {
  if (error.code !== 11000) return error;

  if (error.keyPattern?.slug || error.keyValue?.slug) {
    return new ApiError(409, "A category with this name creates an existing URL slug.");
  }

  if (error.keyPattern?.name || error.keyValue?.name) {
    return new ApiError(409, "Category already exists.");
  }

  return new ApiError(409, "A category with these details already exists.");
};

// Best-effort image cleanup.
// A cleanup failure should not undo an already successful DB operation.
const cleanupImage = async (fileId, context) => {
  if (!fileId) return;

  try {
    await deleteImage(fileId);
  } catch (error) {
    logger.error(`Image cleanup failed (${context}):`, error);
  }
};

/*
 * Validate parent category and prevent circular hierarchy.
 */
const validateParentCategory = async ({ categoryId, parentCategoryId }) => {
  if (
    parentCategoryId === undefined ||
    parentCategoryId === null ||
    parentCategoryId === "" ||
    parentCategoryId === "null"
  ) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(parentCategoryId)) {
    throw new ApiError(400, "Invalid parent category.");
  }

  if (String(categoryId) === String(parentCategoryId)) {
    throw new ApiError(400, "A category cannot be its own parent.");
  }

  const parent = await Category.findById(parentCategoryId);

  if (!parent) {
    throw new ApiError(404, "Parent category not found.");
  }

  if (parent.isArchived) {
    throw new ApiError(400, "Archived categories cannot be used as parent categories.");
  }

  if (!parent.isActive) {
    throw new ApiError(400, "Inactive categories cannot be used as parent categories.");
  }

  // Walk upward to detect circular hierarchy.
  let current = parent;
  const visited = new Set();

  while (current?.parentCategory) {
    const currentId = String(current._id);

    if (visited.has(currentId)) {
      throw new ApiError(400, "Existing circular category hierarchy detected.");
    }

    visited.add(currentId);

    const ancestorId = String(current.parentCategory);

    if (categoryId && ancestorId === String(categoryId)) {
      throw new ApiError(400, "Circular category hierarchy detected.");
    }

    current = await Category.findById(ancestorId);

    if (!current) {
      throw new ApiError(400, "Invalid category hierarchy: parent category not found.");
    }
  }

  return parent._id;
};

/*
 * Create category.
 */
const createCategory = async (categoryData, file) => {
  const normalizedName = categoryData.name.trim();

  const existingCategory = await Category.findOne({
    name: {
      $regex: `^${escapeRegex(normalizedName)}$`,
      $options: "i",
    },
  });

  if (existingCategory) {
    throw new ApiError(409, "Category already exists.");
  }

  const parentCategory = await validateParentCategory({
    parentCategoryId: categoryData.parentCategory,
  });

  let uploadedImage = null;

  try {
    if (file) {
      uploadedImage = await uploadImage(file, "/categories");
    }

    const categoryPayload = {
      ...categoryData,
      name: normalizedName,
      parentCategory,
    };

    if (uploadedImage) {
      categoryPayload.image = uploadedImage;
    }

    const category = await Category.create(categoryPayload);

    return category;
  } catch (error) {
    // Remove uploaded image if category creation fails.
    if (uploadedImage?.fileId) {
      await cleanupImage(uploadedImage.fileId, "category creation");
    }

    throw handleDuplicateKeyError(error);
  }
};

/*
 * Get active categories for storefront.
 */
const getActiveCategories = async () => {
  return Category.find({
    isActive: true,
    isArchived: { $ne: true },
  }).sort({
    displayOrder: 1,
    createdAt: -1,
  });
};

/*
 * Internal category lookup.
 * Used by admin/service operations.
 */
const getCategoryById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID.");
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  return category;
};

/*
 * Public category lookup by ID.
 */
const getPublicCategoryById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID.");
  }

  const category = await Category.findOne({
    _id: id,
    isActive: true,
    isArchived: { $ne: true },
  });

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  return category;
};

/*
 * Public category lookup by slug.
 */
const getCategoryBySlug = async (slug) => {
  const category = await Category.findOne({
    slug,
    isActive: true,
    isArchived: { $ne: true },
  });

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  return category;
};

/*
 * Update category.
 */
const updateCategory = async (id, updateData, file) => {
  const category = await getCategoryById(id);

  /*
   * Prevent status changes on archived categories.
   */
  if (category.isArchived && updateData.isActive !== undefined) {
    throw new ApiError(400, "Restore the category before changing its status.");
  }

  /*
   * Duplicate name check.
   */
  if (updateData.name !== undefined) {
    const normalizedName = updateData.name.trim();

    if (normalizedName !== category.name) {
      const existingCategory = await Category.findOne({
        _id: { $ne: category._id },
        name: {
          $regex: `^${escapeRegex(normalizedName)}$`,
          $options: "i",
        },
      });

      if (existingCategory) {
        throw new ApiError(409, "Category already exists.");
      }

      category.name = normalizedName;
    }
  }

  /*
   * Parent category validation.
   */
  if (updateData.parentCategory !== undefined) {
    category.parentCategory = await validateParentCategory({
      categoryId: category._id,
      parentCategoryId: updateData.parentCategory,
    });
  }

  /*
   * Prevent activating a category under an inactive parent.
   */
  if (updateData.isActive === true && category.parentCategory) {
    await validateParentCategory({
      categoryId: category._id,
      parentCategoryId: category.parentCategory,
    });
  }

  /*
   * Simple fields.
   */
  if (updateData.description !== undefined) {
    category.description = updateData.description;
  }

  if (updateData.isFeatured !== undefined) {
    category.isFeatured = updateData.isFeatured;
  }

  if (updateData.isActive !== undefined) {
    category.isActive = updateData.isActive;
  }

  if (updateData.displayOrder !== undefined) {
    category.displayOrder = updateData.displayOrder;
  }

  if (updateData.seo !== undefined) {
    const existingSeo = category.seo?.toObject ? category.seo.toObject() : category.seo || {};

    category.seo = {
      ...existingSeo,
      ...updateData.seo,
    };
  }

  /*
   * Upload new image before replacing the old one.
   */
  const oldImageFileId = category.image?.fileId;
  let uploadedImage = null;

  if (file) {
    uploadedImage = await uploadImage(file, "/categories");
    category.image = uploadedImage;
  }

  try {
    await category.save();
  } catch (error) {
    // New image is not needed if DB save fails.
    if (uploadedImage?.fileId) {
      await cleanupImage(uploadedImage.fileId, "category update rollback");
    }

    throw handleDuplicateKeyError(error);
  }

  /*
   * Delete old image only after successful DB save.
   */
  if (uploadedImage?.fileId && oldImageFileId && oldImageFileId !== uploadedImage.fileId) {
    await cleanupImage(oldImageFileId, "old category image replacement");
  }

  return category;
};

/*
 * Get categories for admin dashboard.
 */
const getAdminCategories = async (query = {}) => {
  const { page = 1, limit = 20, search, status, archived, featured, sort = "newest" } = query;

  const requestedPage = Number(page);
  const requestedLimit = Number(limit);

  const pageNumber = Number.isFinite(requestedPage) ? Math.max(Math.floor(requestedPage), 1) : 1;

  const limitNumber = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.floor(requestedLimit), 1), 100)
    : 20;

  const skip = (pageNumber - 1) * limitNumber;

  const filter = {};

  /*
   * Search.
   */
  if (typeof search === "string" && search.trim()) {
    const searchValue = escapeRegex(search.trim());

    filter.$or = [
      {
        name: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        slug: {
          $regex: searchValue,
          $options: "i",
        },
      },
    ];
  }

  /*
   * Status.
   */
  if (status === "active") {
    filter.isActive = true;
  } else if (status === "inactive") {
    filter.isActive = false;
  }

  /*
   * Archive.
   */
  if (archived === "true") {
    filter.isArchived = true;
  } else if (archived === "false") {
    filter.isArchived = { $ne: true };
  }

  /*
   * Featured.
   */
  if (featured === "true") {
    filter.isFeatured = true;
  } else if (featured === "false") {
    filter.isFeatured = false;
  }

  /*
   * Sorting.
   */
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    nameAsc: { name: 1 },
    nameDesc: { name: -1 },
    displayOrderAsc: { displayOrder: 1 },
    displayOrderDesc: { displayOrder: -1 },
  };

  const sortQuery = sortOptions[sort] || sortOptions.newest;

  const [categories, totalCategories] = await Promise.all([
    Category.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "products",
          let: {
            categoryId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$category", "$$categoryId"],
                },
                isArchived: { $ne: true },
              },
            },
            {
              $count: "count",
            },
          ],
          as: "products",
        },
      },
      {
        $addFields: {
          productCount: {
            $ifNull: [{ $arrayElemAt: ["$products.count", 0] }, 0],
          },
        },
      },
      {
        $project: {
          products: 0,
        },
      },
      {
        $sort: {
          ...sortQuery,
          _id: 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limitNumber,
      },
    ]),

    Category.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCategories / limitNumber);

  return {
    categories,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalCategories,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
    },
  };
};

/*
 * Toggle category status.
 */
const toggleCategoryStatus = async (id) => {
  const category = await getCategoryById(id);

  if (category.isArchived) {
    throw new ApiError(400, "Restore the category before changing its status.");
  }

  if (!category.isActive && category.parentCategory) {
    await validateParentCategory({
      categoryId: category._id,
      parentCategoryId: category.parentCategory,
    });
  }

  category.isActive = !category.isActive;

  await category.save();

  return category;
};

/*
 * Archive category.
 */
const archiveCategory = async (id) => {
  const category = await getCategoryById(id);

  if (category.isArchived) {
    throw new ApiError(400, "Category is already archived.");
  }

  /*
   * Prevent archiving if non-archived child categories exist.
   */
  const childCategories = await Category.countDocuments({
    parentCategory: category._id,
    isArchived: { $ne: true },
  });

  if (childCategories > 0) {
    throw new ApiError(
      400,
      `Cannot archive category. ${childCategories} child categor(y/ies) still belong to it.`
    );
  }

  /*
   * Prevent archiving while active products still belong to it.
   */
  const activeProducts = await Product.countDocuments({
    category: category._id,
    isArchived: { $ne: true },
    isActive: true,
  });

  if (activeProducts > 0) {
    throw new ApiError(
      400,
      `Cannot archive category. ${activeProducts} active product(s) still belong to this category.`
    );
  }

  category.isArchived = true;

  await category.save();

  return category;
};

/*
 * Restore category.
 */
const restoreCategory = async (id) => {
  const category = await getCategoryById(id);

  if (!category.isArchived) {
    throw new ApiError(400, "Category is already restored.");
  }

  // Ensure the parent is still valid before restoring.
  if (category.parentCategory) {
    await validateParentCategory({
      categoryId: category._id,
      parentCategoryId: category.parentCategory,
    });
  }

  category.isArchived = false;

  await category.save();

  return category;
};

export default {
  createCategory,
  getActiveCategories,
  getCategoryById,
  getPublicCategoryById,
  getCategoryBySlug,
  updateCategory,
  getAdminCategories,
  toggleCategoryStatus,
  archiveCategory,
  restoreCategory,
};
