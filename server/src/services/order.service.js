import mongoose from "mongoose";

import Order, { ORDER_STATUS, SHIPMENT_STATUS } from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

import ApiError from "../utils/ApiError.js";

import cartPricingService from "./cartPricing.service.js";
import ReturnRequest from "../models/ReturnRequest.js";

import { createRazorpayOrder, getRazorpayPayment } from "./payment.service.js";

import { verifyRazorpaySignature } from "../utils/razorpay.js";

import {
  sendSellerNewOrderEmail,
  sendSellerPaidOrderEmail,
} from "../features/notifications/services/sellerNotification.service.js";
import { createAdminOrderNotification } from "./notification.service.js";

import shippingService from "../features/shipping/services/shipping.service.js";
/**
 * Generate a unique, customer-friendly order number.
 *
 * Example:
 * YC-1784899234123-5832
 */
const generateOrderNumber = () => {
  const timestamp = Date.now();

  const random = Math.floor(1000 + Math.random() * 9000);

  return `YC-${timestamp}-${random}`;
};

const releaseOnlineOrderReservation = async (orderId) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const order = await Order.findOne({
      _id: orderId,
      paymentMethod: "ONLINE",
      paymentStatus: "PENDING",
    }).session(session);

    if (!order) {
      throw new ApiError(404, "Pending online order not found.");
    }

    /*
     * Release reserved inventory.
     */
    for (const item of order.items) {
      const result = await Product.updateOne(
        {
          _id: item.product,
          reservedStock: {
            $gte: item.quantity,
          },
        },
        {
          $inc: {
            stock: item.quantity,
            reservedStock: -item.quantity,
          },
        },
        {
          session,
        }
      );

      if (result.modifiedCount !== 1) {
        throw new ApiError(409, "Unable to release reserved product stock.");
      }
    }

    /*
     * Mark payment/order as failed/cancelled.
     */
    order.paymentStatus = "FAILED";

    order.payment.failureReason = "Payment initialization failed.";

    order.orderStatus = ORDER_STATUS.CANCELLED;

    order.cancelledAt = new Date();

    order.statusHistory.push({
      status: ORDER_STATUS.CANCELLED,
      timestamp: new Date(),
    });

    await order.save({ session });

    await session.commitTransaction();

    return order;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

const verifyOnlinePayment = async ({
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  /*
   * ==========================================
   * 1. Validate payment response
   * ==========================================
   */

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, "Payment verification details are required.");
  }

  /*
   * ==========================================
   * 2. Find OUR order
   * ==========================================
   */

  const order = await Order.findOne({
    user: userId,

    paymentMethod: "ONLINE",

    "payment.provider": "RAZORPAY",

    "payment.providerOrderId": razorpayOrderId,
  });

  if (!order) {
    throw new ApiError(404, "Payment order not found.");
  }

  /*
   * ==========================================
   * 3. Already paid?
   * ==========================================
   */

  if (order.paymentStatus === "PAID") {
    await processPaidOrder({
      orderId: order._id,
    });

    return {
      success: true,

      alreadyPaid: true,

      order,
    };
  }

  /*
   * ==========================================
   * 4. Don't pay cancelled orders
   * ==========================================
   */

  if (order.orderStatus === ORDER_STATUS.CANCELLED) {
    throw new ApiError(400, "This order is no longer payable.");
  }

  /*
   * ==========================================
   * 5. Verify Razorpay signature
   * ==========================================
   */

  const signatureValid = verifyRazorpaySignature({
    orderId: order.payment.providerOrderId,

    paymentId: razorpayPaymentId,

    signature: razorpaySignature,
  });

  if (!signatureValid) {
    throw new ApiError(400, "Payment signature verification failed.");
  }

  /*
   * ==========================================
   * 6. Fetch payment directly from Razorpay
   * ==========================================
   */

  const razorpayPayment = await getRazorpayPayment(razorpayPaymentId);

  /*
   * ==========================================
   * 7. Finalize payment
   * ==========================================
   */

  const result = await finalizeOnlinePayment({
    orderId: order._id,

    userId,

    razorpayPayment,

    razorpaySignature,
  });

  await createShiprocketShipmentForOrder(result.order._id);

  /*
   * ==========================================
   * 8. Seller notification
   * ==========================================
   *
   * Only send when THIS request actually
   * changed the order from PENDING → PAID.
   */

  if (result.finalized && result.order) {
    sendSellerPaidOrderEmail(result.order).catch((error) => {
      console.error("Seller paid-order email failed:", error);
    });

    createAdminOrderNotification({
      order: result.order,
    }).catch((error) => {
      console.error("Admin notification failed:", error);
    });
  }

  return result;
};

const finalizeOnlinePayment = async ({
  orderId,
  userId = null,
  razorpayPayment,
  razorpaySignature = "",
}) => {
  if (!orderId) {
    throw new ApiError(400, "Order ID is required.");
  }

  if (!razorpayPayment) {
    throw new ApiError(400, "Payment details are required.");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    /*
     * 1. Find our order.
     */

    const orderFilter = {
      _id: orderId,
      paymentMethod: "ONLINE",
    };

    if (userId) {
      orderFilter.user = userId;
    }

    const order = await Order.findOne(orderFilter).session(session);

    if (!order) {
      throw new ApiError(404, "Payment order not found.");
    }

    /*
     * 2. Handle already-paid orders.
     *
     * Frontend verification and webhook
     * may both reach this function.
     */

    if (order.paymentStatus === "PAID") {
      await session.commitTransaction();

      return {
        success: true,
        finalized: true,
        alreadyPaid: true,
        order,
      };
    }

    /*
     * 3. Validate order status.
     */

    if (order.orderStatus === ORDER_STATUS.CANCELLED) {
      throw new ApiError(400, "This order is no longer payable.");
    }

    if (order.paymentStatus !== "PENDING") {
      throw new ApiError(409, "This payment can no longer be processed.");
    }

    /*
     * 4. Verify Razorpay order ID.
     */

    if (razorpayPayment.order_id !== order.payment.providerOrderId) {
      throw new ApiError(400, "Payment does not belong to this order.");
    }

    /*
     * 5. Verify currency.
     */

    if (razorpayPayment.currency !== "INR") {
      throw new ApiError(400, "Invalid payment currency.");
    }

    /*
     * 6. Verify amount.
     */

    const expectedAmount = Math.round(order.pricing.grandTotal * 100);

    if (Number(razorpayPayment.amount) !== expectedAmount) {
      throw new ApiError(400, "Payment amount does not match the order.");
    }

    /*
     * 7. Verify captured status.
     */

    if (razorpayPayment.status !== "captured") {
      throw new ApiError(400, "Payment has not been captured yet.");
    }

    /*
     * ========================================
     * 8. FINALIZE INVENTORY
     * ========================================
     *
     * Before payment:
     * stock = reduced
     * reservedStock = increased
     *
     * After payment:
     * reservedStock = reduced
     * sold = increased
     */

    for (const item of order.items) {
      const result = await Product.updateOne(
        {
          _id: item.product,
          reservedStock: {
            $gte: item.quantity,
          },
        },
        {
          $inc: {
            reservedStock: -item.quantity,
            sold: item.quantity,
          },
        },
        {
          session,
        }
      );

      if (result.modifiedCount !== 1) {
        throw new ApiError(409, "Unable to finalize product inventory.");
      }
    }

    /*
     * ========================================
     * 9. UPDATE PAYMENT
     * ========================================
     */

    order.paymentStatus = "PAID";

    order.payment.paymentId = razorpayPayment.id;

    if (razorpaySignature) {
      order.payment.signature = razorpaySignature;
    }

    order.payment.paidAt = new Date();

    order.payment.failureReason = "";

    /*
     * ========================================
     * 10. UPDATE ORDER STATUS
     * ========================================
     */

    order.orderStatus = ORDER_STATUS.CONFIRMED;

    order.statusHistory.push({
      status: ORDER_STATUS.CONFIRMED,
      timestamp: new Date(),
    });

    /*
     * ========================================
     * 11. REMOVE PURCHASED ITEMS FROM CART
     * ========================================
     *
     * Use order.items as the source of truth.
     *
     * Full-cart order:
     * All ordered products are removed.
     *
     * Buy Now order:
     * Only the purchased product is removed.
     */

    const cart = await Cart.findOne({
      user: order.user,
    }).session(session);

    if (cart) {
      const purchasedProductIds = new Set(order.items.map((item) => item.product.toString()));

      cart.items = cart.items.filter(
        (cartItem) => !purchasedProductIds.has(cartItem.product.toString())
      );

      await cart.save({
        session,
      });
    }

    /*
     * ========================================
     * 12. SAVE ORDER
     * ========================================
     */

    await order.save({
      session,
    });

    /*
     * ========================================
     * 13. COMMIT TRANSACTION
     * ========================================
     */

    await session.commitTransaction();

    return {
      success: true,
      finalized: true,
      alreadyPaid: false,
      order,
    };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

const createShiprocketShipmentForOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, "Order not found.");
    }

    // Already created — don't create another Shiprocket order.
    if (order.shipment?.shiprocketOrderId) {
      return order;
    }

    if (order.paymentStatus !== "PAID") {
      throw new ApiError(400, "Shiprocket shipment can only be created for a paid order.");
    }

    const user = await User.findById(order.user).select("fullName email phone");

    if (!user) {
      throw new ApiError(404, "Customer not found while creating shipment.");
    }

    const shipmentResult = await shippingService.createShipmentForOrder({
      order,
      user,
    });

    const shiprocketOrderId = shipmentResult.response?.order_id;

    const shipmentId = shipmentResult.response?.shipment_id;

    if (!shiprocketOrderId || !shipmentId) {
      throw new Error(
        `Shiprocket response did not contain expected IDs: ${JSON.stringify(
          shipmentResult.response
        )}`
      );
    }

    order.shipment.shiprocketOrderId = String(shiprocketOrderId);

    order.shipment.shipmentId = String(shipmentId);

    order.shipment.currentStatus = "CREATED";

    order.shipment.failureReason = "";

    await order.save();

    return order;
  } catch (error) {
    console.error("Shiprocket shipment creation failed:", orderId, error);

    // Important:
    // Payment remains successful.
    // Only shipment creation failed.
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        "shipment.currentStatus": "FAILED",
        "shipment.failureReason": error.message || "Unable to create Shiprocket order.",
      },
    }).catch((saveError) => {
      console.error("Failed to save Shiprocket failure status:", saveError);
    });

    return null;
  }
};

const processPaidOrder = async ({ orderId }) => {
  /*
   * ==========================================
   * 1. Atomically claim shipment creation
   * ==========================================
   *
   * Only one request should be allowed to
   * create the Shiprocket order.
   *
   * This protects us when both:
   * - frontend payment verification
   * - Razorpay webhook
   *
   * reach this function at nearly the same time.
   */

  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,

      paymentStatus: "PAID",

      /*
       * Shiprocket order has not already been created.
       */
      "shipment.shiprocketOrderId": {
        $in: ["", null],
      },

      /*
       * Another request isn't currently creating it.
       */
      "shipment.currentStatus": {
        $ne: SHIPMENT_STATUS.CREATING,
      },
    },
    {
      $set: {
        "shipment.currentStatus": SHIPMENT_STATUS.CREATING,

        "shipment.failureReason": "",
      },
    },
    {
      new: true,
    }
  );

  /*
   * ==========================================
   * 2. Could not claim it
   * ==========================================
   */

  if (!order) {
    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      throw new ApiError(404, "Order not found.");
    }

    return {
      processed: false,

      alreadyProcessingOrCreated: true,

      order: existingOrder,
    };
  }

  /*
   * ==========================================
   * 3. Get customer
   * ==========================================
   */

  try {
    const user = await User.findById(order.user).select("fullName email phone");

    if (!user) {
      throw new ApiError(404, "Customer not found while creating shipment.");
    }

    /*
     * ==========================================
     * 4. Create Shiprocket order
     * ==========================================
     */

    const shipmentResult = await shippingService.createShipmentForOrder({
      order,
      user,
    });

    /*
     * ==========================================
     * 5. Extract Shiprocket IDs
     * ==========================================
     */

    const shiprocketOrderId = shipmentResult.response?.order_id;

    const shipmentId = shipmentResult.response?.shipment_id;

    if (!shiprocketOrderId || !shipmentId) {
      throw new Error(
        `Shiprocket response did not contain expected IDs: ${JSON.stringify(
          shipmentResult.response
        )}`
      );
    }

    /*
     * ==========================================
     * 6. Save shipment information
     * ==========================================
     */

    order.shipment.shiprocketOrderId = String(shiprocketOrderId);

    order.shipment.shipmentId = String(shipmentId);

    order.shipment.currentStatus = SHIPMENT_STATUS.CREATED;

    order.shipment.failureReason = "";

    await order.save();

    console.log(`Shiprocket order created for ${order.orderNumber}:`, {
      shiprocketOrderId,
      shipmentId,
    });

    return {
      processed: true,

      success: true,

      order,
    };
  } catch (error) {
    /*
     * ==========================================
     * 7. Shiprocket creation failed
     * ==========================================
     */

    console.error(`Shiprocket order creation failed for ${order.orderNumber}:`, error);

    order.shipment.currentStatus = SHIPMENT_STATUS.FAILED;

    order.shipment.failureReason = error.message || "Unable to create Shiprocket order.";

    await order.save().catch((saveError) => {
      console.error("Failed to save Shiprocket failure status:", saveError);
    });

    /*
     * IMPORTANT:
     *
     * Payment is already PAID.
     * We do NOT throw the Shiprocket failure
     * as a payment failure.
     */

    return {
      processed: false,

      success: false,

      shipmentFailed: true,

      order,
    };
  }
};

/**
 * Place a Cash on Delivery order.
 */

const placeCODOrder = async ({ userId, addressId, productId = null, idempotencyKey }) => {
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(400, "Invalid address ID");
  }

  if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    throw new ApiError(400, "Idempotency key is required");
  }

  const normalizedIdempotencyKey = idempotencyKey.trim();

  if (!normalizedIdempotencyKey || normalizedIdempotencyKey.length > 100) {
    throw new ApiError(400, "Invalid idempotency key");
  }

  /*
   * --------------------------------
   * Idempotency helper
   * --------------------------------
   */

  const findExistingOrder = async () => {
    const existingOrder = await Order.findOne({
      user: userId,
      idempotencyKey: normalizedIdempotencyKey,
    });

    if (existingOrder && productId) {
      const isSameSingleProductOrder =
        existingOrder.items.length === 1 &&
        existingOrder.items[0].product.toString() === productId.toString();

      if (!isSameSingleProductOrder) {
        throw new ApiError(409, "This idempotency key was already used for a different order.");
      }
    }

    return existingOrder;
  };

  /*
   * --------------------------------
   * Fast idempotency check
   * --------------------------------
   */

  const existingOrder = await findExistingOrder();

  if (existingOrder) {
    return existingOrder;
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    /*
     * 1. Validate address ownership.
     */

    const address = await Address.findOne({
      _id: addressId,
      user: userId,
    }).session(session);

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    /*
     * 2. Load cart.
     */

    const cart = await Cart.findOne({
      user: userId,
    }).session(session);

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Your cart is empty");
    }

    /*
     * 3. Select cart items.
     *
     * Normal checkout:
     * All cart items are selected.
     *
     * Buy Now:
     * Only the requested product is selected.
     */

    let selectedCartItems = cart.items;

    if (productId) {
      selectedCartItems = cart.items.filter(
        (item) => item.product.toString() === productId.toString()
      );

      if (selectedCartItems.length === 0) {
        throw new ApiError(400, "Selected product is not in your cart.");
      }
    }

    // Do not modify the original cart document here.
    const checkoutCart = {
      ...cart.toObject(),
      items: selectedCartItems,
    };

    /*
     * 4. Load selected product data.
     */

    const productIds = selectedCartItems.map((item) => item.product);

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
    }).session(session);

    /*
     * 5. Validate products, stock and calculate pricing.
     */

    const { items: orderItems, pricing } = cartPricingService.buildCartSummary({
      cart: checkoutCart,
      products,
    });

    /*
     * 6. Snapshot delivery address.
     */

    const shippingAddress = {
      fullName: address.fullName,
      phone: address.phone,
      houseNumber: address.houseNumber,
      landmark: address.landmark || "",
      formattedAddress: address.formattedAddress,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || "India",
    };

    /*
     * 7. Calculate shipping for selected items only.
     */

    const shippingQuote = await shippingService.getShippingQuote({
      products,
      cart: checkoutCart,
      deliveryPostcode: address.postalCode,
      paymentMethod: "COD",
    });

    const shippingFee = shippingQuote?.shippingFee || 0;

    const finalPricing = {
      ...pricing,
      shippingFee,
      grandTotal: Number((pricing.itemsTotal + shippingFee).toFixed(2)),
    };

    /*
     * 8. Create order.
     */

    const placedAt = new Date();

    const [order] = await Order.create(
      [
        {
          orderNumber: generateOrderNumber(),
          user: userId,
          idempotencyKey: normalizedIdempotencyKey,
          items: orderItems,
          shippingAddress,
          pricing: finalPricing,
          paymentMethod: "COD",
          paymentStatus: "PENDING",
          orderStatus: ORDER_STATUS.PLACED,
          statusHistory: [
            {
              status: ORDER_STATUS.PLACED,
              timestamp: placedAt,
            },
          ],
          placedAt,
        },
      ],
      {
        session,
      }
    );

    /*
     * 9. Atomically reduce inventory
     * for selected products only.
     */

    for (const cartItem of selectedCartItems) {
      const result = await Product.updateOne(
        {
          _id: cartItem.product,
          isActive: true,
          stock: {
            $gte: cartItem.quantity,
          },
        },
        {
          $inc: {
            stock: -cartItem.quantity,
            sold: cartItem.quantity,
          },
        },
        {
          session,
        }
      );

      if (result.modifiedCount !== 1) {
        throw new ApiError(
          409,
          "Product stock changed while placing your order. Please try again."
        );
      }
    }

    /*
     * 10. Remove purchased items from cart.
     *
     * Buy Now:
     * Remove only the selected product.
     *
     * Normal checkout:
     * Clear the entire cart.
     */

    if (productId) {
      cart.items = cart.items.filter((item) => item.product.toString() !== productId.toString());
    } else {
      cart.items = [];
    }

    await cart.save({
      session,
    });

    /*
     * 11. Commit transaction.
     */

    await session.commitTransaction();

    /*
     * 12. Create Shiprocket shipment.
     */

    try {
      const user = await User.findById(userId).select("fullName email phone");

      if (!user) {
        throw new ApiError(404, "Customer not found while creating shipment.");
      }

      const shipmentResult = await shippingService.createShipmentForOrder({
        order,
        user,
      });

      console.log(
        "SHIPROCKET CREATE ORDER RESPONSE:",
        JSON.stringify(shipmentResult.response, null, 2)
      );

      const shiprocketOrderId = shipmentResult.response?.order_id;

      const shipmentId = shipmentResult.response?.shipment_id;

      if (!shiprocketOrderId || !shipmentId) {
        throw new Error(
          `Shiprocket response did not contain expected IDs: ${JSON.stringify(
            shipmentResult.response
          )}`
        );
      }

      order.shipment.shiprocketOrderId = String(shiprocketOrderId);

      order.shipment.shipmentId = String(shipmentId);

      order.shipment.currentStatus = "CREATED";
      order.shipment.failureReason = "";

      await order.save();
    } catch (error) {
      console.error("Shiprocket order creation failed for order:", order.orderNumber, error);

      order.shipment.currentStatus = "FAILED";

      order.shipment.failureReason = error.message || "Unable to create Shiprocket order.";

      await order.save().catch((saveError) => {
        console.error("Failed to save Shiprocket failure status:", saveError);
      });
    }

    /*
     * 13. Send notifications.
     */

    sendSellerNewOrderEmail(order).catch((error) => {
      console.error("Seller order email failed:", error);
    });

    createAdminOrderNotification({
      order,
    }).catch((error) => {
      console.error("Admin order notification failed:", error);
    });

    return order;
  } catch (error) {
    /*
     * Abort only if transaction is active.
     */

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    /*
     * Handle duplicate idempotency key.
     */

    if (error?.code === 11000) {
      const existingOrder = await findExistingOrder();

      if (existingOrder) {
        return existingOrder;
      }
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

const placeOnlineOrder = async ({ userId, addressId, productId = null, idempotencyKey }) => {
  /*
   * ============================================
   * 1. Validate request
   * ============================================
   */

  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(400, "Invalid address ID");
  }

  if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    throw new ApiError(400, "Idempotency key is required");
  }

  const normalizedIdempotencyKey = idempotencyKey.trim();

  if (!normalizedIdempotencyKey || normalizedIdempotencyKey.length > 100) {
    throw new ApiError(400, "Invalid idempotency key");
  }

  /*
   * ============================================
   * 2. Helper: validate existing order selection
   * ============================================
   *
   * A single-product checkout must not
   * accidentally reuse an order for another
   * product using the same idempotency key.
   */

  const validateExistingOrder = (existingOrder) => {
    if (!productId) {
      return;
    }

    const orderProductIds = existingOrder.items.map((item) => item.product.toString());

    if (orderProductIds.length !== 1 || orderProductIds[0] !== productId.toString()) {
      throw new ApiError(409, "This idempotency key was already used for a different order.");
    }
  };

  /*
   * ============================================
   * 3. Fast idempotency check
   * ============================================
   */

  const existingOrder = await Order.findOne({
    user: userId,
    idempotencyKey: normalizedIdempotencyKey,
  });

  if (existingOrder) {
    validateExistingOrder(existingOrder);

    if (existingOrder.payment?.providerOrderId) {
      return {
        order: existingOrder,

        payment: {
          provider: "RAZORPAY",
          keyId: process.env.RAZORPAY_KEY_ID,
          orderId: existingOrder.payment.providerOrderId,
          amount: Math.round(existingOrder.pricing.grandTotal * 100),
          currency: "INR",
        },
      };
    }

    throw new ApiError(409, "Your payment is already being initialized. Please try again.");
  }

  /*
   * ============================================
   * 4. Load address and cart
   * ============================================
   */

  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  /*
   * ============================================
   * 5. Select cart items
   * ============================================
   *
   * No productId = full cart checkout.
   * productId = selected product only.
   */

  let selectedCartItems = cart.items;

  if (productId) {
    selectedCartItems = cart.items.filter(
      (item) => item.product.toString() === productId.toString()
    );

    if (selectedCartItems.length === 0) {
      throw new ApiError(400, "Selected product is not in your cart.");
    }
  }

  const checkoutCart = {
    ...cart.toObject(),
    items: selectedCartItems,
  };

  /*
   * ============================================
   * 6. Load latest product information
   * ============================================
   */

  const productIds = selectedCartItems.map((item) => item.product);

  const products = await Product.find({
    _id: {
      $in: productIds,
    },
    isActive: true,
    isArchived: false,
  });

  /*
   * ============================================
   * 7. Server-authoritative pricing
   * ============================================
   */

  const { items: orderItems, pricing } = cartPricingService.buildCartSummary({
    cart: checkoutCart,
    products,
  });

  if (!pricing || !Number.isFinite(pricing.grandTotal) || pricing.grandTotal <= 0) {
    throw new ApiError(400, "Invalid order amount.");
  }

  const shippingQuote = await shippingService.getShippingQuote({
    products,
    cart: checkoutCart,
    deliveryPostcode: address.postalCode,
    paymentMethod: "ONLINE",
  });

  const finalPricing = {
    ...pricing,
    shippingFee: shippingQuote.shippingFee,
    grandTotal: Number((pricing.itemsTotal + shippingQuote.shippingFee).toFixed(2)),
  };

  /*
   * ============================================
   * 8. Generate order number
   * ============================================
   */

  const orderNumber = generateOrderNumber();

  /*
   * ============================================
   * 9. Create Razorpay order
   * ============================================
   */

  const razorpayOrder = await createRazorpayOrder({
    orderId: orderNumber,
    amount: finalPricing.grandTotal,
  });

  /*
   * ============================================
   * 10. Create DB order + reserve stock
   * ============================================
   */

  const session = await mongoose.startSession();

  let order;

  try {
    session.startTransaction();

    /*
     * Re-check idempotency inside transaction.
     */

    const concurrentOrder = await Order.findOne({
      user: userId,
      idempotencyKey: normalizedIdempotencyKey,
    }).session(session);

    if (concurrentOrder) {
      await session.abortTransaction();

      validateExistingOrder(concurrentOrder);

      if (concurrentOrder.payment?.providerOrderId) {
        return {
          order: concurrentOrder,

          payment: {
            provider: "RAZORPAY",
            keyId: process.env.RAZORPAY_KEY_ID,
            orderId: concurrentOrder.payment.providerOrderId,
            amount: Math.round(concurrentOrder.pricing.grandTotal * 100),
            currency: "INR",
          },
        };
      }

      throw new ApiError(409, "Order is already being processed.");
    }

    /*
     * ========================================
     * 11. Re-load cart inside transaction
     * ========================================
     */

    const currentCart = await Cart.findOne({
      user: userId,
    }).session(session);

    if (!currentCart || currentCart.items.length === 0) {
      throw new ApiError(400, "Your cart is empty.");
    }

    /*
     * Re-select the same checkout items.
     */

    let currentSelectedItems = currentCart.items;

    if (productId) {
      currentSelectedItems = currentCart.items.filter(
        (item) => item.product.toString() === productId.toString()
      );

      if (currentSelectedItems.length === 0) {
        throw new ApiError(
          409,
          "Selected product is no longer in your cart. Please refresh checkout."
        );
      }
    }

    const currentCheckoutCart = {
      ...currentCart.toObject(),
      items: currentSelectedItems,
    };

    /*
     * ========================================
     * 12. Re-load selected products
     * ========================================
     */

    const currentProductIds = currentSelectedItems.map((item) => item.product);

    const currentProducts = await Product.find({
      _id: {
        $in: currentProductIds,
      },
      isActive: true,
      isArchived: false,
    }).session(session);

    /*
     * ========================================
     * 13. Recalculate pricing
     * ========================================
     */

    const { items: currentOrderItems, pricing: currentPricing } =
      cartPricingService.buildCartSummary({
        cart: currentCheckoutCart,
        products: currentProducts,
      });

    const currentShippingQuote = await shippingService.getShippingQuote({
      products: currentProducts,
      cart: currentCheckoutCart,
      deliveryPostcode: address.postalCode,
      paymentMethod: "ONLINE",
    });

    const currentFinalPricing = {
      ...currentPricing,
      shippingFee: currentShippingQuote.shippingFee,
      grandTotal: Number((currentPricing.itemsTotal + currentShippingQuote.shippingFee).toFixed(2)),
    };

    /*
     * ========================================
     * 14. Verify amount has not changed
     * ========================================
     */

    if (
      currentFinalPricing.itemsTotal !== finalPricing.itemsTotal ||
      currentFinalPricing.discount !== finalPricing.discount ||
      currentFinalPricing.tax !== finalPricing.tax ||
      currentFinalPricing.shippingFee !== finalPricing.shippingFee ||
      currentFinalPricing.grandTotal !== finalPricing.grandTotal
    ) {
      throw new ApiError(
        409,
        "Your cart or delivery charges changed. Please refresh checkout and try again."
      );
    }

    /*
     * ========================================
     * 15. Snapshot shipping address
     * ========================================
     */

    const shippingAddress = {
      fullName: address.fullName,
      phone: address.phone,
      houseNumber: address.houseNumber,
      landmark: address.landmark || "",
      formattedAddress: address.formattedAddress,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || "India",
    };

    /*
     * ========================================
     * 16. Reserve selected inventory
     * ========================================
     *
     * Only currentSelectedItems are reserved.
     */

    for (const cartItem of currentSelectedItems) {
      const result = await Product.updateOne(
        {
          _id: cartItem.product,
          isActive: true,
          isArchived: false,
          stock: {
            $gte: cartItem.quantity,
          },
        },
        {
          $inc: {
            stock: -cartItem.quantity,
            reservedStock: cartItem.quantity,
          },
        },
        {
          session,
        }
      );

      if (result.modifiedCount !== 1) {
        throw new ApiError(
          409,
          "Product stock changed while placing your order. Please try again."
        );
      }
    }

    /*
     * ========================================
     * 17. Create DB order
     * ========================================
     */

    const placedAt = new Date();

    const [createdOrder] = await Order.create(
      [
        {
          orderNumber,
          user: userId,
          idempotencyKey: normalizedIdempotencyKey,
          items: currentOrderItems,
          shippingAddress,
          pricing: currentFinalPricing,
          paymentMethod: "ONLINE",
          paymentStatus: "PENDING",
          orderStatus: ORDER_STATUS.PLACED,

          statusHistory: [
            {
              status: ORDER_STATUS.PLACED,
              timestamp: placedAt,
            },
          ],

          payment: {
            provider: "RAZORPAY",
            providerOrderId: razorpayOrder.id,
            paymentId: "",
            signature: "",
            failureReason: "",
            paidAt: null,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          },

          placedAt,
        },
      ],
      {
        session,
      }
    );

    order = createdOrder;

    /*
     * ========================================
     * 18. Commit transaction
     * ========================================
     */

    await session.commitTransaction();
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    if (error?.code === 11000) {
      const duplicateOrder = await Order.findOne({
        user: userId,
        idempotencyKey: normalizedIdempotencyKey,
      });

      if (duplicateOrder) {
        validateExistingOrder(duplicateOrder);

        if (duplicateOrder.payment?.providerOrderId) {
          return {
            order: duplicateOrder,

            payment: {
              provider: "RAZORPAY",
              keyId: process.env.RAZORPAY_KEY_ID,
              orderId: duplicateOrder.payment.providerOrderId,
              amount: Math.round(duplicateOrder.pricing.grandTotal * 100),
              currency: "INR",
            },
          };
        }
      }
    }

    throw error;
  } finally {
    await session.endSession();
  }

  /*
   * ============================================
   * 19. Return checkout information
   * ============================================
   */

  return {
    order,

    payment: {
      provider: "RAZORPAY",
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    },
  };
};

const getOrderById = async ({ userId, orderId }) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  /*
   * Get product IDs from the order
   */
  const productIds = order.items.map((item) => item.product.toString());

  /*
   * Get reviews written by this user
   * for products in this order.
   */
  let reviews = [];

  if (productIds.length > 0) {
    reviews = await Review.find({
      user: userId,
      product: {
        $in: productIds,
      },
    }).select("_id product rating title comment images");
  }

  /*
   * Create product -> review lookup
   */
  const reviewMap = new Map();

  reviews.forEach((review) => {
    reviewMap.set(review.product.toString(), review);
  });

  /*
   * Convert mongoose document
   * into plain object.
   */
  const orderObject = order.toObject();

  const returnRequest = await ReturnRequest.findOne({
    order: order._id,
    user: userId,
  }).lean();

  orderObject.returnRequest = returnRequest || null;

  /*
   * Add review information to
   * every order item.
   */
  orderObject.items = orderObject.items.map((item) => {
    const review = reviewMap.get(item.product.toString());

    return {
      ...item,

      orderId: orderObject._id,

      review: {
        canReview: orderObject.orderStatus === ORDER_STATUS.DELIVERED && !review,

        hasReviewed: Boolean(review),

        reviewId: review?._id || null,

        review: review || null,
      },
    };
  });
  return orderObject;
};

const getUserOrders = async ({ userId, page = 1, limit = 10, status }) => {
  const pageNumber = Math.max(Number(page) || 1, 1);

  const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 50);

  const skip = (pageNumber - 1) * limitNumber;

  const filter = {
    user: userId,
  };

  if (status) {
    filter.orderStatus = status;
  }

  const [orders, totalOrders] = await Promise.all([
    Order.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber),

    Order.countDocuments(filter),
  ]);

  /*
   * Get all product ids from current page
   */
  const productIds = orders.flatMap((order) => order.items.map((item) => item.product.toString()));

  /*
   * Get all reviews for these products by this user
   */
  const reviews = await Review.find({
    user: userId,
    product: {
      $in: productIds,
    },
  });

  /*
   * Create lookup map
   */
  const reviewMap = new Map();

  reviews.forEach((review) => {
    reviewMap.set(review.product.toString(), review);
  });

  /*
   * Enrich each order item
   */
  const enrichedOrders = orders.map((order) => {
    const orderObject = order.toObject();

    orderObject.items = orderObject.items.map((item) => {
      const review = reviewMap.get(item.product.toString());
      item.orderId = order._id;
      item.review = {
        canReview: order.orderStatus === ORDER_STATUS.DELIVERED && !review,

        hasReviewed: !!review,

        reviewId: review?._id || null,

        review: review || null,
      };

      return item;
    });

    return orderObject;
  });

  const totalPages = Math.ceil(totalOrders / limitNumber);

  return {
    orders: enrichedOrders,

    pagination: {
      page: pageNumber,

      limit: limitNumber,

      totalOrders,

      totalPages,

      hasNextPage: pageNumber < totalPages,

      hasPrevPage: pageNumber > 1,
    },
  };
};

const cancelOrder = async ({ userId, orderId, reason = "" }) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    /*
     * Find only an order belonging
     * to the authenticated customer.
     */
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).session(session);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    /*
     * Customers may cancel only before
     * order processing has started.
     */
    const cancellableStatuses = [ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED];

    if (!cancellableStatuses.includes(order.orderStatus)) {
      throw new ApiError(400, `Order cannot be cancelled when status is ${order.orderStatus}`);
    }

    /*
     * Restore inventory.
     *
     * placeCODOrder decreases stock and
     * increases sold, so cancellation
     * must reverse both operations.
     */
    const stockUpdates = order.items.map((item) => ({
      updateOne: {
        filter: {
          _id: item.product,
        },

        update: {
          $inc: {
            stock: item.quantity,
            sold: -item.quantity,
          },
        },
      },
    }));

    if (stockUpdates.length > 0) {
      await Product.bulkWrite(stockUpdates, {
        session,
      });
    }

    /*
     * Update order status.
     */
    const cancelledAt = new Date();

    order.orderStatus = ORDER_STATUS.CANCELLED;

    order.cancelledAt = cancelledAt;

    order.cancellationReason = reason.trim();

    /*
     * Add cancellation to timeline.
     */
    order.statusHistory.push({
      status: ORDER_STATUS.CANCELLED,
      timestamp: cancelledAt,
    });

    await order.save({
      session,
    });

    /*
     * Commit inventory restoration
     * and order cancellation together.
     */
    await session.commitTransaction();

    return order;
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    await session.endSession();
  }
};

const getAdminOrders = async (query = {}) => {
  const {
    page = 1,
    limit = 20,
    search = "",
    status = "",
    paymentStatus = "",
    paymentMethod = "",
    sort = "newest",
  } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);

  const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const skip = (pageNumber - 1) * limitNumber;

  const filter = {};

  /*
   * Search
   *
   * For now search by order number.
   * Customer search is discussed below.
   */
  if (search?.trim()) {
    const searchValue = search.trim();

    filter.orderNumber = {
      $regex: searchValue,
      $options: "i",
    };
  }

  /*
   * Order status
   */
  if (status && Object.values(ORDER_STATUS).includes(status)) {
    filter.orderStatus = status;
  }

  /*
   * Payment status
   */
  const validPaymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

  if (paymentStatus && validPaymentStatuses.includes(paymentStatus)) {
    filter.paymentStatus = paymentStatus;
  }

  /*
   * Payment method
   */
  const validPaymentMethods = ["COD", "ONLINE"];

  if (paymentMethod && validPaymentMethods.includes(paymentMethod)) {
    filter.paymentMethod = paymentMethod;
  }

  /*
   * Sorting
   */
  const sortOptions = {
    newest: {
      createdAt: -1,
    },

    oldest: {
      createdAt: 1,
    },

    totalHigh: {
      "pricing.grandTotal": -1,
    },

    totalLow: {
      "pricing.grandTotal": 1,
    },
  };

  const sortQuery = sortOptions[sort] || sortOptions.newest;

  /*
   * Query
   */
  const [orders, totalOrders] = await Promise.all([
    Order.find(filter)
      .populate("user", "displayName username email phone")
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNumber),

    Order.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalOrders / limitNumber);

  return {
    orders,

    pagination: {
      page: pageNumber,
      limit: limitNumber,

      totalOrders,
      totalPages,

      hasNextPage: pageNumber < totalPages,

      hasPrevPage: pageNumber > 1,
    },
  };
};

const getAdminOrderById = async (orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const order = await Order.findById(orderId).populate("user", "displayName username email phone");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return order;
};

const updateAdminOrderStatus = async ({ orderId, status }) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const validTransitions = {
    [ORDER_STATUS.PLACED]: [ORDER_STATUS.CONFIRMED],

    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING],

    [ORDER_STATUS.PROCESSING]: [],

    [ORDER_STATUS.SHIPPED]: [],

    [ORDER_STATUS.OUT_FOR_DELIVERY]: [],

    [ORDER_STATUS.DELIVERED]: [],

    [ORDER_STATUS.RTO]: [],

    [ORDER_STATUS.CANCELLED]: [],
  };

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (!Object.values(ORDER_STATUS).includes(status)) {
    throw new ApiError(400, "Invalid order status");
  }

  const allowedStatuses = validTransitions[order.orderStatus] || [];

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, `Order cannot be changed from ${order.orderStatus} to ${status}`);
  }

  await updateOrderStatus({
    order,
    status,
  });

  await order.save();

  return order.populate("user", "displayName username email phone");
};

const updateOrderStatus = async ({ order, status, changedAt = new Date() }) => {
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (!Object.values(ORDER_STATUS).includes(status)) {
    throw new ApiError(400, "Invalid order status");
  }

  if (order.orderStatus === status) {
    return false;
  }

  order.orderStatus = status;

  const lastHistoryEntry = order.statusHistory?.[order.statusHistory.length - 1];

  if (lastHistoryEntry?.status !== status) {
    order.statusHistory.push({
      status,
      timestamp: changedAt,
    });
  }

  if (status === ORDER_STATUS.DELIVERED) {
    order.deliveredAt = changedAt;

    /*
     * COD becomes paid when the order is delivered.
     */
    if (order.paymentMethod === "COD") {
      order.paymentStatus = "PAID";
    }
  }

  if (status === ORDER_STATUS.CANCELLED) {
    order.cancelledAt = changedAt;
  }

  return true;
};

export { updateOrderStatus };

const cancelAdminOrder = async ({ orderId, reason = "" }) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const cancellationReason = reason.trim();

  if (!cancellationReason) {
    throw new ApiError(400, "Cancellation reason is required");
  }

  if (cancellationReason.length > 500) {
    throw new ApiError(400, "Cancellation reason cannot exceed 500 characters");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    /*
     * Only these statuses can be cancelled
     * by the admin.
     */
    const cancellableStatuses = [
      ORDER_STATUS.PLACED,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PROCESSING,
    ];

    if (!cancellableStatuses.includes(order.orderStatus)) {
      throw new ApiError(400, `Order cannot be cancelled when status is ${order.orderStatus}`);
    }

    /*
     * Don't cancel paid online orders
     * until refund handling is implemented.
     */
    if (order.paymentMethod === "ONLINE" && order.paymentStatus === "PAID") {
      throw new ApiError(400, "Paid online orders require a refund before cancellation");
    }

    /*
     * Restore inventory and reverse
     * sold count.
     */
    const stockUpdates = order.items.map((item) => ({
      updateOne: {
        filter: {
          _id: item.product,
        },

        update: {
          $inc: {
            stock: item.quantity,
            sold: -item.quantity,
          },
        },
      },
    }));

    if (stockUpdates.length > 0) {
      await Product.bulkWrite(stockUpdates, {
        session,
      });
    }

    /*
     * Update order.
     */
    const cancelledAt = new Date();

    order.orderStatus = ORDER_STATUS.CANCELLED;

    order.cancellationReason = cancellationReason;

    order.cancelledAt = cancelledAt;

    order.statusHistory.push({
      status: ORDER_STATUS.CANCELLED,

      timestamp: cancelledAt,
    });

    await order.save({
      session,
    });

    /*
     * Save ID before finishing transaction.
     */
    const cancelledOrderId = order._id;

    /*
     * Commit database changes.
     */
    await session.commitTransaction();

    /*
     * IMPORTANT:
     *
     * Don't populate `order` here because
     * it is attached to the transaction
     * session.
     *
     * Fetch a fresh document without
     * the transaction session instead.
     */
    const updatedOrder = await Order.findById(cancelledOrderId).populate(
      "user",
      "displayName username email phone"
    );

    return updatedOrder;
  } catch (error) {
    /*
     * Only abort if the transaction
     * is still active.
     */
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

const orderService = {
  placeCODOrder,
  placeOnlineOrder,
  verifyOnlinePayment,
  finalizeOnlinePayment,
  processPaidOrder,
  getOrderById,
  getUserOrders,
  cancelOrder,
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  updateOrderStatus,
  cancelAdminOrder,
};

export default orderService;
