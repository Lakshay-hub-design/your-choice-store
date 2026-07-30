import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import productService from "../services/product.service.js";

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.files);

  return res.status(201).json(new ApiResponse(201, "Product created successfully", product));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts(req.query);

  return res.status(200).json(new ApiResponse(200, "Products fetched successfully", products));
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);

  return res.status(200).json(new ApiResponse(200, "Product fetched successfully", product));
});

const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);

  const products = await productService.getRelatedProducts(product._id, product.category._id, 4);

  return res
    .status(200)
    .json(new ApiResponse(200, "Related products fetched successfully", products));
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.files);

  return res.status(200).json(new ApiResponse(200, "Product updated successfully", product));
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);

  return res.status(200).json(new ApiResponse(200, "Product deleted successfully"));
});

const getAdminProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAdminProducts(req.query);

  return res.status(200).json(new ApiResponse(200, "Admin products fetched successfully", result));
});

const getAdminProductById = asyncHandler(async (req, res) => {
  const product = await productService.getAdminProductById(req.params.id);

  return res.status(200).json(new ApiResponse(200, "Product fetched successfully", product));
});

const updateProductStatus = asyncHandler(async (req, res) => {
  const product = await productService.updateProductStatus(req.params.id, req.body.isActive);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        product.isActive ? "Product activated successfully" : "Product deactivated successfully",
        product
      )
    );
});

const archiveProduct = asyncHandler(async (req, res) => {
  const product = await productService.archiveProduct(req.params.id);

  return res.status(200).json(new ApiResponse(200, "Product archived successfully", product));
});

const restoreProduct = asyncHandler(async (req, res) => {
  const product = await productService.restoreProduct(req.params.id);

  return res.status(200).json(new ApiResponse(200, "Product restored successfully", product));
});

export {
  createProduct,
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  getAdminProductById,
  updateProductStatus,
  archiveProduct,
  restoreProduct,
};
