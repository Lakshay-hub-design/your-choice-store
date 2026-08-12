import orderService from "../services/order.service.js";
import ApiError from "../utils/ApiError.js";

import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import verifyWebhookSignature from "../utils/verifyWebhookSignature.js";
import processRazorpayWebhook from "../services/razorpayWebhook.service.js";

import { sendSellerPaidOrderEmail } from "../features/notifications/services/sellerNotification.service.js";

const placeOrder = asyncHandler(async (req, res) => {
  const { addressId, paymentMethod } = req.body;

  const idempotencyKey = req.headers["idempotency-key"];

  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    throw new ApiError(400, "Idempotency key is required");
  }

  let result;

  switch (paymentMethod) {
    case "COD":
      result = await orderService.placeCODOrder({
        userId: req.user._id,

        addressId,

        idempotencyKey,
      });

      return res.status(201).json(
        new ApiResponse(201, "Order placed successfully", {
          order: result,
          payment: null,
        })
      );

    case "ONLINE":
      result = await orderService.placeOnlineOrder({
        userId: req.user._id,

        addressId,

        idempotencyKey,
      });

      return res.status(201).json(new ApiResponse(201, "Payment initialized successfully", result));

    default:
      throw new ApiError(400, "Unsupported payment method");
  }
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const result = await orderService.verifyOnlinePayment({
    userId: req.user._id,

    razorpayOrderId: razorpay_order_id,

    razorpayPaymentId: razorpay_payment_id,

    razorpaySignature: razorpay_signature,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result.alreadyPaid ? "Payment already verified." : "Payment verified successfully.",
        result
      )
    );
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById({
    userId: req.user._id,
    orderId: req.params.orderId,
  });

  return res.status(200).json(new ApiResponse(200, "Order fetched successfully", order));
});

const getUserOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getUserOrders({
    userId: req.user._id,

    page: req.query.page,

    limit: req.query.limit,

    status: req.query.status,
  });

  return res.status(200).json(new ApiResponse(200, "Orders fetched successfully", result));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder({
    userId: req.user._id,
    orderId: req.params.orderId,
    reason: req.body.reason || "",
  });

  return res.status(200).json(new ApiResponse(200, "Order cancelled successfully", order));
});

const getAdminOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAdminOrders(req.query);

  return res.status(200).json(new ApiResponse(200, "Orders fetched successfully", result));
});

const getAdminOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getAdminOrderById(req.params.id);

  return res.status(200).json(new ApiResponse(200, "Order fetched successfully", order));
});

const updateAdminOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateAdminOrderStatus({
    orderId: req.params.id,
    status: req.body.status,
  });

  return res.status(200).json(new ApiResponse(200, "Order status updated successfully", order));
});

const cancelAdminOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelAdminOrder({
    orderId: req.params.id,
    reason: req.body.reason,
  });

  return res.status(200).json(new ApiResponse(200, "Order cancelled successfully", order));
});

const razorpayWebhook = asyncHandler(async (req, res) => {
  /*
   * req.body must be a Buffer.
   */
  const rawBody = req.body;

  const signature = req.headers["x-razorpay-signature"];

  console.log("Webhook body is Buffer:", Buffer.isBuffer(req.body));

  console.log("Webhook signature:", req.headers["x-razorpay-signature"]);

  /*
   * Verify Razorpay signature.
   */
  const signatureValid = verifyWebhookSignature({
    rawBody,
    signature,
  });

  if (!signatureValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid webhook signature.",
    });
  }

  /*
   * Parse only AFTER signature
   * verification.
   */
  const event = JSON.parse(rawBody.toString("utf8"));

  const result = await processRazorpayWebhook({
    event,
  });

  /*
   * Send seller email only when
   * this webhook actually finalized
   * the payment.
   */
  if (result.finalized && result.order) {
    sendSellerPaidOrderEmail(result.order).catch((error) => {
      console.error("Seller webhook payment email failed:", error);
    });
  }

  /*
   * Razorpay needs a 2xx response.
   */
  return res.status(200).json({
    success: true,
    received: true,
  });
});

export {
  placeOrder,
  verifyPayment,
  getOrderById,
  getUserOrders,
  cancelOrder,
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  cancelAdminOrder,
  razorpayWebhook,
};
