import ApiError from "../utils/ApiError.js";
import shippingService from "../features/shipping/services/shipping.service.js";
import asyncHandler from "../utils/asyncHandler.js";

import crypto from "crypto";

import processShipmentWebhook from "../features/shipping/services/shiprocketWebhook.service.js";

const safeCompareSecrets = (received, expected) => {
  if (!received || !expected) {
    return false;
  }

  const receivedBuffer = Buffer.from(received);

  const expectedBuffer = Buffer.from(expected);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
};

const getAvailableCouriers = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const result = await shippingService.getAvailableCouriersForOrder({
    orderId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

const assignCourier = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const { courierId } = req.body;

  if (!courierId) {
    throw new ApiError(400, "Courier ID is required.");
  }

  const result = await shippingService.assignCourierToOrder({
    orderId,
    courierId,
  });

  res.status(200).json({
    success: true,
    message: "Courier assigned successfully.",
    data: result,
  });
});

const schedulePickup = async (req, res) => {
  const { orderId } = req.params;
  const { pickupDate, retry = false } = req.body;

  const result = await shippingService.schedulePickupForOrder({
    orderId,
    pickupDate,
    retry,
  });

  res.status(200).json({
    success: true,
    message: "Pickup scheduled successfully.",
    data: result,
  });
};

const trackShipment = async (req, res) => {
  const { orderId } = req.params;

  const result = await shippingService.trackOrderShipment({
    orderId,
  });

  res.status(200).json({
    success: true,
    message: "Shipment tracking updated successfully.",
    data: result,
  });
};

const shiprocketTrackingWebhook = async (req, res) => {
  const expectedSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;

  const receivedSecret = req.get("x-api-key") || "";

  /*
   * Shiprocket documents x-api-key as the
   * webhook security token.
   */
  if (expectedSecret && !safeCompareSecrets(receivedSecret, expectedSecret)) {
    console.warn("Rejected Shiprocket webhook: invalid x-api-key.");

    /*
     * Shiprocket expects the webhook endpoint
     * to respond with HTTP 200.
     */
    return res.status(200).json({
      success: false,
      message: "Webhook received.",
    });
  }

  try {
    const result = await processShipmentWebhook({
      payload: req.body,
    });

    return res.status(200).json({
      success: true,
      processed: result.processed,
    });
  } catch (error) {
    console.error("Shiprocket webhook processing failed:", error);

    /*
     * Still return 200 because Shiprocket's
     * webhook documentation specifies that the
     * callback should return HTTP 200.
     */
    return res.status(200).json({
      success: false,
      message: "Webhook received.",
    });
  }
};

const getTracking = async (req, res) => {
  const { orderId } = req.params;

  const tracking = await shippingService.getTrackingForOrder({
    orderId,
    user: req.user,
  });

  res.status(200).json({
    success: true,
    data: tracking,
  });
};

export {
  getAvailableCouriers,
  assignCourier,
  schedulePickup,
  trackShipment,
  shiprocketTrackingWebhook,
  getTracking,
};
