import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import returnService from "../services/return.service.js";

export const createReturnRequest = asyncHandler(async (req, res) => {
  const { orderId, items, reason, description } = req.body;

  const returnRequest = await returnService.createReturnRequest({
    userId: req.user._id,
    orderId,
    items,
    reason,
    description,
    files: req.files || [],
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Return request submitted successfully", returnRequest));
});

export const getReturnRequests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const result = await returnService.getReturnRequests({
    page: Number(page),
    limit: Number(limit),
    status,
  });

  return res.status(200).json(new ApiResponse(200, "Return requests fetched successfully", result));
});

/*
 * ==========================================
 * Get single return request
 * ==========================================
 */

export const getReturnRequestById = asyncHandler(async (req, res) => {
  const { returnId } = req.params;

  const returnRequest = await returnService.getReturnRequestById(returnId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Return request fetched successfully", returnRequest));
});
