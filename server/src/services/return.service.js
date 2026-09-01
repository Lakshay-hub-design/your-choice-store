import mongoose from "mongoose";

import Order from "../models/Order.js";
import ReturnRequest from "../models/ReturnRequest.js";

import ApiError from "../utils/ApiError.js";
import { generateReturnNumber } from "../utils/generateReturnNumber.js";

import { uploadImage, deleteImages } from "./image.service.js";

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

export default {
  createReturnRequest,
  getReturnRequests,
  getReturnRequestById,
};
