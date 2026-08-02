import mongoose from "mongoose";

import Category from "../models/Category.js";
import Product from "../models/Product.js";

import ApiError from "../utils/ApiError.js";

import { uploadImage, deleteImage } from "./image.service.js";

const validateParentCategory = async ({ categoryId, parentCategoryId }) => {
  /*
   * Remove parent.
   */
  if (!parentCategoryId || parentCategoryId === "null") {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(parentCategoryId)) {
    throw new ApiError(400, "Invalid parent category.");
  }

  /*
   * A category cannot be
   * its own parent.
   */
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

  /*
   * Walk upward through the tree.
   *
   * If we ever reach the current
   * category, we have created
   * a circular hierarchy.
   */
  let current = parent;

  const visited = new Set();

  while (current?.parentCategory) {
    if (visited.has(String(current._id))) {
      break;
    }

    visited.add(String(current._id));

    if (String(current.parentCategory) === String(categoryId)) {
      throw new ApiError(400, "Circular category hierarchy detected.");
    }

    current = await Category.findById(current.parentCategory);
  }

  return parent._id;
};

const createCategory = async (categoryData, file) => {
  const normalizedName = categoryData.name.trim();

  const existingCategory = await Category.findOne({
    name: {
      $regex: new RegExp(`^${normalizedName}$`, "i"),
    },
  });

  if (existingCategory) {
    throw new ApiError(409, "Category already exists.");
  }

  /*
   * Validate parent category.
   */
  const parentCategory = await validateParentCategory({
    parentCategoryId: categoryData.parentCategory,
  });

  let image = {};

  if (file) {
    image = await uploadImage(file, "/categories");
  }

  const category = await Category.create({
    ...categoryData,

    name: normalizedName,

    parentCategory,

    image,
  });

  return category;
};

const getActiveCategories = async () => {
  return await Category.find({
    isActive: true,
  }).sort({
    displayOrder: 1,
    createdAt: -1,
  });
};

const getCategoryById = async (id) => {
  console.log("getCategoryById called with id:", id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID.");
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  return category;
};

const getCategoryBySlug = async (slug) => {
  const category = await Category.findOne({
    slug,
    isActive: true,
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return category;
};

const updateCategory = async (id, updateData, file) => {
  const category = await getCategoryById(id);

  /*
   * Duplicate name check.
   */
  if (updateData.name && updateData.name.trim() !== category.name) {
    const normalizedName = updateData.name.trim();

    const existingCategory = await Category.findOne({
      _id: {
        $ne: category._id,
      },

      name: {
        $regex: new RegExp(`^${normalizedName}$`, "i"),
      },
    });

    if (existingCategory) {
      throw new ApiError(409, "Category already exists.");
    }

    category.name = normalizedName;
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
   * Replace image.
   */
  if (file) {
    if (category.image?.fileId) {
      await deleteImage(category.image.fileId);
    }

    category.image = await uploadImage(file, "/categories");
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

  if (updateData.seo) {
    category.seo = {
      ...category.seo,
      ...updateData.seo,
    };
  }

  await category.save();

  return category;
};

const getAdminCategories = async (query = {}) => {
  const { page = 1, limit = 20, search, status, archived, featured, sort = "newest" } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);

  const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const skip = (pageNumber - 1) * limitNumber;

  const filter = {};

  /*
   * Search
   */
  if (search?.trim()) {
    const searchValue = search.trim();

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
   * Status
   */
  if (status === "active") {
    filter.isActive = true;
  }

  if (status === "inactive") {
    filter.isActive = false;
  }

  /*
   * Archive
   */
  if (archived === "true") {
    filter.isArchived = true;
  }

  if (archived === "false") {
    filter.isArchived = false;
  }

  /*
   * Featured
   */
  if (featured === "true") {
    filter.isFeatured = true;
  }

  if (featured === "false") {
    filter.isFeatured = false;
  }

  /*
   * Sorting
   */
  const sortOptions = {
    newest: {
      createdAt: -1,
    },

    oldest: {
      createdAt: 1,
    },

    nameAsc: {
      name: 1,
    },

    nameDesc: {
      name: -1,
    },

    displayOrderAsc: {
      displayOrder: 1,
    },

    displayOrderDesc: {
      displayOrder: -1,
    },
  };

  const sortQuery = sortOptions[sort] || sortOptions.newest;

  /*
   * Aggregate so we can return
   * product count.
   */
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

                isArchived: false,
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
            $ifNull: [
              {
                $arrayElemAt: ["$products.count", 0],
              },
              0,
            ],
          },
        },
      },

      {
        $project: {
          products: 0,
        },
      },

      {
        $sort: sortQuery,
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

const toggleCategoryStatus = async (id) => {
  const category = await getCategoryById(id);

  category.isActive = !category.isActive;

  await category.save();

  return category;
};

const archiveCategory = async (id) => {
  const category = await getCategoryById(id);

  if (category.isArchived) {
    throw new ApiError(400, "Category is already archived.");
  }

  /*
   * Prevent archiving when
   * active products still
   * belong to this category.
   */
  const activeProducts = await Product.countDocuments({
    category: category._id,

    isArchived: false,
    isActive: true,
  });

  if (activeProducts > 0) {
    throw new ApiError(
      400,
      `Cannot archive category. ${activeProducts} product(s) still belong to this category.`
    );
  }

  category.isArchived = true;

  await category.save();

  return category;
};

const restoreCategory = async (id) => {
  const category = await getCategoryById(id);

  if (!category.isArchived) {
    throw new ApiError(400, "Category is already restored.");
  }

  category.isArchived = false;

  await category.save();

  return category;
};

export default {
  createCategory,
  getActiveCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  getAdminCategories,
  toggleCategoryStatus,
  archiveCategory,
  restoreCategory,
};
