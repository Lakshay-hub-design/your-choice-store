import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import reviewService from "../services/review.service.js";

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(
    req.user._id,
    req.params.productId,
    req.body,
    req.files
  );

  return res.status(201).json(new ApiResponse(201, "Review submitted successfully.", review));
});

const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getProductReviews(req.params.productId, req.query);

  return res.status(200).json(new ApiResponse(200, "Reviews fetched successfully.", reviews));
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(
    req.params.reviewId,
    req.user._id,
    req.body,
    req.files
  );

  return res.status(200).json(new ApiResponse(200, "Review updated successfully.", review));
});

const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.reviewId, req.user._id);

  return res.status(200).json(new ApiResponse(200, "Review deleted successfully."));
});

const getReviewStatus = asyncHandler(async (req, res) => {
  const reviewStatus = await reviewService.getReviewStatus(req.user?._id, req.params.productId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Review status fetched successfully.", reviewStatus));
});

export default {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getReviewStatus,
};
