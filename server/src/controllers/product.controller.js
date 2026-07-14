import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import productService from "../services/product.service.js";

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.files);

  return res.status(201).json(new ApiResponse(201, "Product created succesfully", product));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts(req.query);

  return res.status(200).json(new ApiResponse(200, "Products fetched successfully", products));
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);

  return res.status(200).json(new ApiResponse(200, "Product fetched successfully", product));
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.files);

  return res.status(200).json(new ApiResponse(200, "Product updated successfully", product));
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);

  return res.status(200).json(new ApiResponse(200, "Product deleted successfully"));
});

export { createProduct, getAllProducts, getProductBySlug, updateProduct, deleteProduct };
