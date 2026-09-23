import mongoose from "mongoose";

import Order from "../models/Order.js";
import ReturnRequest from "../models/ReturnRequest.js";
import { RETURN_STATUS } from "../models/ReturnRequest.js";

import ApiError from "../utils/ApiError.js";
import { generateReturnNumber } from "../utils/generateReturnNumber.js";

import { uploadImage, deleteImages } from "./image.service.js";

import RETURN_ADDRESS from "../config/returnAddress.js";

const createReturnRequest = async ({ userId, orderId, items, reason, description, files = [] }) => {
  /*
   * ==========================================
   * 1. Validate Order ID
   * ==========================================
   */

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  /*
   * ==========================================
   * 2. Find customer's order
   * ==========================================
   */

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  /*
   * ==========================================
   * 3. Order must be delivered
   * ==========================================
   */

  if (order.orderStatus !== "DELIVERED") {
    throw new ApiError(400, "A return can only be requested for a delivered order");
  }

  /*
   * ==========================================
   * 4. Validate items
   * ==========================================
   */

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "At least one item is required");
  }

  /*
   * ==========================================
   * 5. Check existing active return
   * ==========================================
   */

  const existingReturn = await ReturnRequest.findOne({
    order: order._id,
    user: userId,

    status: {
      $nin: ["REJECTED", "CANCELLED", "COMPLETED"],
    },
  });

  if (existingReturn) {
    throw new ApiError(409, "An active return request already exists for this order");
  }

  /*
   * ==========================================
   * 6. Build return items
   * ==========================================
   */

  const returnItems = [];

  for (const requestedItem of items) {
    const { productId, quantity } = requestedItem;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new ApiError(400, "Invalid product ID");
    }

    const orderItem = order.items.find((item) => item.product.toString() === productId);

    if (!orderItem) {
      throw new ApiError(400, "One or more selected products do not belong to this order");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ApiError(400, "Invalid return quantity");
    }

    if (quantity > orderItem.quantity) {
      throw new ApiError(
        400,
        `Return quantity for ${orderItem.name} cannot exceed purchased quantity`
      );
    }

    /*
     * Check previous returns for this product.
     */

    const previousReturns = await ReturnRequest.find({
      order: order._id,
      user: userId,
      "items.product": orderItem.product,

      status: {
        $nin: ["REJECTED", "CANCELLED"],
      },
    });

    let alreadyReturnedQuantity = 0;

    for (const previousReturn of previousReturns) {
      const previousItem = previousReturn.items.find(
        (item) => item.product.toString() === orderItem.product.toString()
      );

      if (previousItem) {
        alreadyReturnedQuantity += previousItem.quantity;
      }
    }

    if (alreadyReturnedQuantity + quantity > orderItem.quantity) {
      throw new ApiError(
        400,
        `You cannot return more than the purchased quantity for ${orderItem.name}`
      );
    }

    /*
     * Snapshot order information.
     */

    returnItems.push({
      product: orderItem.product,

      name: orderItem.name,

      sku: orderItem.sku,

      image: orderItem.image,

      price: orderItem.price,

      quantity,

      reason,
    });
  }

  /*
   * ==========================================
   * 7. Upload images
   * ==========================================
   */

  const uploadedImages = [];

  try {
    for (const file of files) {
      const uploaded = await uploadImage(file, "/returns");

      uploadedImages.push({
        fileId: uploaded.fileId,
        url: uploaded.url,
      });
    }

    /*
     * ========================================
     * 8. Create return request
     * ========================================
     */

    const returnRequest = await ReturnRequest.create({
      returnNumber: generateReturnNumber(),

      order: order._id,

      user: userId,

      items: returnItems,

      reason,

      description,

      images: uploadedImages,

      status: "PENDING",
    });

    return returnRequest;
  } catch (error) {
    /*
     * ========================================
     * 9. Cleanup uploaded images
     * ========================================
     *
     * If ImageKit upload succeeded but
     * ReturnRequest creation failed, remove
     * those files from ImageKit.
     */

    const fileIds = uploadedImages.map((image) => image.fileId).filter(Boolean);

    if (fileIds.length > 0) {
      await deleteImages(fileIds).catch((cleanupError) => {
        console.error("Failed to cleanup return images:", cleanupError);
      });
    }

    throw error;
  }
};

/*
 * ==========================================
 * Get return requests
 * ==========================================
 */

const getReturnRequests = async ({ page = 1, limit = 10, status }) => {
  const currentPage = Math.max(Number(page) || 1, 1);

  const perPage = Math.min(Math.max(Number(limit) || 10, 1), 50);

  const skip = (currentPage - 1) * perPage;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  const [returns, total] = await Promise.all([
    ReturnRequest.find(filter)
      .populate({
        path: "user",
        select: "fullName email phone",
      })
      .populate({
        path: "order",
        select: "orderNumber paymentMethod paymentStatus pricing orderStatus createdAt",
      })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(perPage)
      .lean(),

    ReturnRequest.countDocuments(filter),
  ]);

  return {
    returns,

    pagination: {
      page: currentPage,

      limit: perPage,

      total,

      totalPages: Math.ceil(total / perPage),

      hasNextPage: currentPage * perPage < total,

      hasPreviousPage: currentPage > 1,
    },
  };
};

/*
 * ==========================================
 * Get single return request
 * ==========================================
 */

const getReturnRequestById = async (returnId) => {
  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return request ID");
  }

  const returnRequest = await ReturnRequest.findById(returnId)
    .populate({
      path: "user",
      select: "fullName email phone",
    })
    .populate({
      path: "order",
    });

  if (!returnRequest) {
    throw new ApiError(404, "Return request not found");
  }

  return returnRequest;
};

/*
 * ==========================================
 * Approve return request
 * ==========================================
 */

const approveReturnRequest = async ({ returnId, adminId, adminNote = "" }) => {
  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return request ID");
  }

  const returnRequest = await ReturnRequest.findById(returnId);

  if (!returnRequest) {
    throw new ApiError(404, "Return request not found");
  }

  /*
   * Only pending / under-review requests
   * can be approved.
   */
  if (!["PENDING", "UNDER_REVIEW"].includes(returnRequest.status)) {
    throw new ApiError(
      409,
      `Return request cannot be approved from ${returnRequest.status} status`
    );
  }

  /*
   * Snapshot the return address.
   *
   * This address belongs to THIS return request.
   * If the business address changes later,
   * existing returns will still have the
   * original destination.
   */
  returnRequest.returnAddress = {
    name: RETURN_ADDRESS.name,
    phone: RETURN_ADDRESS.phone,
    addressLine1: RETURN_ADDRESS.addressLine1,
    addressLine2: RETURN_ADDRESS.addressLine2,
    city: RETURN_ADDRESS.city,
    state: RETURN_ADDRESS.state,
    postalCode: RETURN_ADDRESS.postalCode,
  };

  returnRequest.status = "APPROVED";

  returnRequest.reviewedBy = adminId;

  returnRequest.reviewedAt = new Date();

  returnRequest.adminNote = adminNote.trim();

  returnRequest.approvedAt = new Date();

  await returnRequest.save();

  return returnRequest;
};

/*
 * ==========================================
 * Reject return request
 * ==========================================
 */

const rejectReturnRequest = async ({ returnId, adminId, adminNote }) => {
  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return request ID");
  }

  const returnRequest = await ReturnRequest.findById(returnId);

  if (!returnRequest) {
    throw new ApiError(404, "Return request not found");
  }

  /*
   * Only pending/review requests can
   * be rejected.
   */

  if (!["PENDING", "UNDER_REVIEW"].includes(returnRequest.status)) {
    throw new ApiError(
      409,
      `Return request cannot be rejected from ${returnRequest.status} status`
    );
  }

  if (!adminNote?.trim()) {
    throw new ApiError(400, "A rejection reason is required");
  }

  returnRequest.status = "REJECTED";

  returnRequest.reviewedBy = adminId;

  returnRequest.reviewedAt = new Date();

  returnRequest.adminNote = adminNote.trim();

  await returnRequest.save();

  return returnRequest;
};

const markReturnAsShipped = async ({ returnId, userId, courierName, trackingNumber }) => {
  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return request ID");
  }

  const returnRequest = await ReturnRequest.findOne({
    _id: returnId,
    user: userId,
  });

  if (!returnRequest) {
    throw new ApiError(404, "Return request not found");
  }

  /*
   * Customer can only ship an
   * APPROVED return.
   */

  if (returnRequest.status !== "APPROVED") {
    throw new ApiError(409, "Only approved return requests can be marked as shipped");
  }

  if (!courierName?.trim()) {
    throw new ApiError(400, "Courier name is required");
  }

  if (!trackingNumber?.trim()) {
    throw new ApiError(400, "Tracking number is required");
  }

  returnRequest.status = "RETURN_IN_TRANSIT";

  returnRequest.returnShipment = {
    courier: courierName.trim(),

    trackingNumber: trackingNumber.trim(),

    shippedAt: new Date(),

    receivedAt: null,
  };

  await returnRequest.save();

  return returnRequest;
};

const markReturnAsReceived = async ({ returnId, adminId }) => {
  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return request ID");
  }

  const returnRequest = await ReturnRequest.findById(returnId);

  if (!returnRequest) {
    throw new ApiError(404, "Return request not found");
  }

  if (returnRequest.status !== "RETURN_IN_TRANSIT") {
    throw new ApiError(
      409,
      `Return cannot be marked as received from ${returnRequest.status} status`
    );
  }

  returnRequest.status = "RETURN_RECEIVED";

  if (!returnRequest.returnShipping) {
    returnRequest.returnShipping = {};
  }

  returnRequest.returnShipping.receivedAt = new Date();

  returnRequest.receivedBy = adminId;

  await returnRequest.save();

  return returnRequest;
};

const inspectReturnRequest = async ({ returnId, inspectionResult, inspectionNote }) => {
  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return ID");
  }

  const validResults = ["ACCEPTED", "DAMAGED", "USED", "WRONG_PRODUCT", "MISSING_PARTS", "OTHER"];

  if (!validResults.includes(inspectionResult)) {
    throw new ApiError(400, "Invalid inspection result");
  }

  const returnRequest = await ReturnRequest.findById(returnId);

  if (!returnRequest) {
    throw new ApiError(404, "Return request not found");
  }

  if (returnRequest.status !== RETURN_STATUS.RETURN_RECEIVED) {
    throw new ApiError(400, "Return can only be inspected after it has been received");
  }

  if (inspectionResult !== "ACCEPTED" && !inspectionNote?.trim()) {
    throw new ApiError(400, "Inspection note is required for this inspection result");
  }

  returnRequest.inspection = {
    result: inspectionResult,
    note: inspectionNote?.trim() || "",
    inspectedAt: new Date(),
  };

  returnRequest.status = RETURN_STATUS.INSPECTED;

  await returnRequest.save();

  return returnRequest;
};

const calculateReturnRefundAmount = (returnRequest, order) => {
  return returnRequest.items.reduce((total, item) => {
    return total + Number(item.price || 0) * Number(item.quantity || 0);
  }, 0);
};

const processReturnRefund = async ({ returnId, adminId }) => {
  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return ID");
  }

  const returnRequest = await ReturnRequest.findById(returnId).populate("order");

  if (!returnRequest) {
    throw new ApiError(404, "Return request not found");
  }

  if (returnRequest.status !== RETURN_STATUS.INSPECTED) {
    throw new ApiError(400, "Refund can only be processed after inspection");
  }

  if (returnRequest.inspection?.result !== "ACCEPTED") {
    throw new ApiError(400, "Refund cannot be processed because the inspection was not accepted");
  }

  if (
    returnRequest.refund?.status === "PROCESSING" ||
    returnRequest.refund?.status === "COMPLETED"
  ) {
    throw new ApiError(400, "Refund has already been processed or is currently being processed");
  }

  const order = returnRequest.order;

  if (!order) {
    throw new ApiError(404, "Associated order not found");
  }

  const refundAmount = calculateReturnRefundAmount(returnRequest, order);

  if (refundAmount <= 0) {
    throw new ApiError(400, "Refund amount must be greater than zero");
  }

  // Prevent duplicate processing
  returnRequest.status = RETURN_STATUS.REFUND_PROCESSING;

  returnRequest.refund = {
    ...returnRequest.refund,
    status: "PROCESSING",
    amount: refundAmount,
    provider: order.paymentMethod === "ONLINE" ? "RAZORPAY" : "MANUAL",
    failureReason: "",
  };

  await returnRequest.save();

  return {
    returnRequest,
    refundAmount,
  };
};

export default {
  createReturnRequest,
  getReturnRequests,
  getReturnRequestById,
  approveReturnRequest,
  rejectReturnRequest,
  markReturnAsShipped,
  markReturnAsReceived,
  inspectReturnRequest,
  processReturnRefund,
};
