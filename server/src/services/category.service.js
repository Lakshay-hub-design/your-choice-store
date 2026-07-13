import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";
import { uploadImage } from "./image.service.js";

const createCategory = async (categoryData, file) => {
  const normalizedName = categoryData.name.trim();

  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
  });

  if (existingCategory) {
    throw new ApiError(409, "Category already exist");
  }

  let image = {};

  if (file) {
    image = await uploadImage(file, "/categories");
  }

  const category = await Category.create({ ...categoryData, image });

  return category;
};

const getAllCategories = async () => {
  return await Category.find({
    isActive: true,
  }).sort({
    displayOrder: 1,
    createdAt: -1,
  });
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

const updateCategory = async (id, updateData) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  Object.assign(category, updateData);

  await category.save();

  return category;
};

const deleteCategory = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (!category.isActive) {
    throw new ApiError(400, "Category is already deleted");
  }

  category.isActive = false;

  await category.save();

  return category;
};

export default {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};
