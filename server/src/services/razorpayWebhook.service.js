import Order from "../models/Order.js";

import ApiError from "../utils/ApiError.js";

import orderService from "../services/order.service.js";

const processRazorpayWebhook = async ({ event }) => {
  /*
   * We currently care about payment.captured.
   */
  if (event?.event !== "payment.captured") {
    return {
      processed: false,
      ignored: true,
    };
  }

  /*
   * Get payment information from Razorpay.
   */
  const payment = event.payload?.payment?.entity;

  if (!payment) {
    throw new ApiError(400, "Payment data missing from webhook.");
  }

  /*
   * Razorpay order ID.
   */
  const razorpayOrderId = payment.order_id;

  if (!razorpayOrderId) {
    throw new ApiError(400, "Razorpay order ID missing.");
  }

  /*
   * Find our order using the Razorpay
   * order ID that we stored when creating
   * the online order.
   */
  const order = await Order.findOne({
    paymentMethod: "ONLINE",

    "payment.provider": "RAZORPAY",

    "payment.providerOrderId": razorpayOrderId,
  });

  if (!order) {
    /*
     * Don't blindly create/update anything.
     */
    throw new ApiError(404, "Local order not found.");
  }

  /*
   * Finalize using the SAME function
   * used by frontend verification.
   */
  const result = await orderService.finalizeOnlinePayment({
    orderId: order._id,

    razorpayPayment: payment,
  });

  return result;
};

export default processRazorpayWebhook;
