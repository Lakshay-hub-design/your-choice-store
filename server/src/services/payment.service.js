import Razorpay from "razorpay";
import crypto from "crypto";

import mongoose from "mongoose";

import Order, { ORDER_STATUS } from "../models/Order.js";

import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order.
 *
 * IMPORTANT:
 * amount is received in INR,
 * Razorpay expects paise.
 */
const createRazorpayOrder = async ({ orderId, amount }) => {
  if (!orderId) {
    throw new ApiError(400, "Order ID is required.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, "Invalid payment amount.");
  }

  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",

      receipt: orderId.toString(),

      notes: {
        orderId: orderId.toString(),
      },
    });

    return razorpayOrder;
  } catch (error) {
    console.error("Razorpay order creation failed:", error);

    throw new ApiError(502, "Unable to initialize online payment.");
  }
};

/**
 * Fetch a Razorpay order.
 */
const getRazorpayOrder = async (razorpayOrderId) => {
  try {
    return await razorpay.orders.fetch(razorpayOrderId);
  } catch (error) {
    console.error("Razorpay order fetch failed:", error);

    throw new ApiError(502, "Unable to verify payment order.");
  }
};

/**
 * Fetch a Razorpay payment.
 */
const getRazorpayPayment = async (paymentId) => {
  try {
    return await razorpay.payments.fetch(paymentId);
  } catch (error) {
    console.error("Razorpay payment fetch failed:", error);

    throw new ApiError(502, "Unable to verify payment.");
  }
};

export { createRazorpayOrder, getRazorpayOrder, getRazorpayPayment };
