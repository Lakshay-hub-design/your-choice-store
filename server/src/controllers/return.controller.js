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

/*
 * ==========================================
 * Approve return
 * ==========================================
 */

export const approveReturnRequest = asyncHandler(async (req, res) => {
  const { returnId } = req.params;

  const { adminNote = "" } = req.body;

  const returnRequest = await returnService.approveReturnRequest({
    returnId,

    adminId: req.user._id,

    adminNote,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Return request approved successfully", returnRequest));
});

/*
 * ==========================================
 * Reject return
 * ==========================================
 */

export const rejectReturnRequest = asyncHandler(async (req, res) => {
  const { returnId } = req.params;

  const { adminNote } = req.body;

  const returnRequest = await returnService.rejectReturnRequest({
    returnId,

    adminId: req.user._id,

    adminNote,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Return request rejected successfully", returnRequest));
});

export const markReturnAsShipped = asyncHandler(async (req, res) => {
  const { returnId } = req.params;

  const { courierName, trackingNumber } = req.body;

  const returnRequest = await returnService.markReturnAsShipped({
    returnId,

    userId: req.user._id,

    courierName,

    trackingNumber,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Return marked as shipped successfully", returnRequest));
});

export const markReturnAsReceived = asyncHandler(async (req, res) => {
  const { returnId } = req.params;

  const returnRequest = await returnService.markReturnAsReceived({
    returnId,
    adminId: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Return marked as received successfully", returnRequest));
});

export const inspectReturn = asyncHandler(async (req, res) => {
  const { returnId } = req.params;

  const { inspectionResult, inspectionNote } = req.body;

  const returnRequest = await returnService.inspectReturnRequest({
    returnId,
    inspectionResult,
    inspectionNote,
  });

  return res.status(200).json({
    success: true,
    message: "Return inspection completed",
    data: returnRequest,
  });
});

export const processRefund = asyncHandler(async (req, res) => {
  const { returnId } = req.params;

  const result = await returnService.processReturnRefund({
    returnId,
    adminId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    message: "Refund processing started.",
    data: result.returnRequest,
  });
});
