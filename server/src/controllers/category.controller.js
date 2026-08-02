import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import categoryService from "../services/category.service.js";

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.file);

  return res.status(201).json(new ApiResponse(201, "Category created successfully", category));
});

const getActiveCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getActiveCategories();

  return res.status(200).json(new ApiResponse(200, "Categories fetched successfully", categories));
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);

  return res.status(200).json(new ApiResponse(200, "Category fetched successfully", category));
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);

  return res.status(200).json(new ApiResponse(200, "Category fetched successfully", category));
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);

  return res.status(200).json(new ApiResponse(200, "Category updated successfully", category));
});

const getAdminCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAdminCategories(req.query);

  return res.status(200).json(new ApiResponse(200, "Categories fetched succesfully", categories));
});

const toggleCategoryStatus = asyncHandler(async (req, res) => {
  const category = await categoryService.toggleCategoryStatus(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Category status updated successfully.", category));
});

const archiveCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.archiveCategory(req.params.id);

  return res.status(200).json(new ApiResponse(200, "Category archived successfully.", category));
});

const restoreCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.restoreCategory(req.params.id);

  return res.status(200).json(new ApiResponse(200, "Category restored successfully.", category));
});

export {
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
