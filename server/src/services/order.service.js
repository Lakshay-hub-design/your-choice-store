import mongoose from "mongoose";

import Order, { ORDER_STATUS } from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import Review from "../models/Review.js";

import ApiError from "../utils/ApiError.js";

import cartPricingService from "./cartPricing.service.js";

import { createRazorpayOrder, getRazorpayPayment } from "./payment.service.js";

import { verifyRazorpaySignature } from "../utils/razorpay.js";

import {
  sendSellerNewOrderEmail,
  sendSellerPaidOrderEmail,
} from "../features/notifications/services/sellerNotification.service.js";

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
     * Find our order.
     *
     * userId is supplied when this function
     * is called from the normal frontend
     * verification flow.
     *
     * Webhooks don't have our user's JWT,
     * so userId can be null.
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
     * Already paid.
     *
     * This is extremely important because:
     *
     * frontend verification
     * and
     * webhook
     *
     * can both reach the server.
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
     * Cancelled orders cannot be finalized.
     */
    if (order.orderStatus === ORDER_STATUS.CANCELLED) {
      throw new ApiError(400, "This order is no longer payable.");
    }

    /*
     * Only PENDING payments can be finalized.
     */
    if (order.paymentStatus !== "PENDING") {
      throw new ApiError(409, "This payment can no longer be processed.");
    }

    /*
     * Verify Razorpay order ID.
     *
     * This ensures that the payment belongs
     * to THIS order.
     */
    if (razorpayPayment.order_id !== order.payment.providerOrderId) {
      throw new ApiError(400, "Payment does not belong to this order.");
    }

    /*
     * Currency verification.
     */
    if (razorpayPayment.currency !== "INR") {
      throw new ApiError(400, "Invalid payment currency.");
    }

    /*
     * Amount verification.
     *
     * Our database stores rupees.
     * Razorpay stores paise.
     */
    const expectedAmount = Math.round(order.pricing.grandTotal * 100);

    if (Number(razorpayPayment.amount) !== expectedAmount) {
      throw new ApiError(400, "Payment amount does not match the order.");
    }

    /*
     * Payment must actually be captured.
     */
    if (razorpayPayment.status !== "captured") {
      throw new ApiError(400, "Payment has not been captured yet.");
    }

    /*
     * ========================================
     * INVENTORY
     * ========================================
     *
     * Before payment:
     *
     * stock = available stock
     * reservedStock = temporarily reserved
     *
     * After successful payment:
     *
     * reservedStock decreases
     * sold increases
     *
     * We DO NOT increase stock here.
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
     * PAYMENT
     * ========================================
     */

    order.paymentStatus = "PAID";

    order.payment.paymentId = razorpayPayment.id;

    /*
     * Frontend verification has a Razorpay
     * payment signature.
     *
     * Webhook does not use this same field.
     */
    if (razorpaySignature) {
      order.payment.signature = razorpaySignature;
    }

    order.payment.paidAt = new Date();

    order.payment.failureReason = "";

    /*
     * ========================================
     * ORDER
     * ========================================
     */

    order.orderStatus = ORDER_STATUS.CONFIRMED;

    order.statusHistory.push({
      status: ORDER_STATUS.CONFIRMED,
      timestamp: new Date(),
    });

    const cart = await Cart.findOne({
      user: order.user,
    }).session(session);

    if (cart) {
      cart.items = [];

      await cart.save({
        session,
      });
    }

    await order.save({
      session,
    });

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

/**
 * Place a Cash on Delivery order.
 */
const placeCODOrder = async ({ userId, addressId, idempotencyKey }) => {
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(400, "Invalid address ID");
  }

  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    throw new ApiError(400, "Idempotency key is required");
  }

  /*
   * Normalize and limit the key.
   */
  const normalizedIdempotencyKey = idempotencyKey.trim();

  if (!normalizedIdempotencyKey || normalizedIdempotencyKey.length > 100) {
    throw new ApiError(400, "Invalid idempotency key");
  }

  /*
   * Fast path:
   *
   * If this request was already completed,
   * return the previously created order.
   */
  const existingOrder = await Order.findOne({
    user: userId,
    idempotencyKey: normalizedIdempotencyKey,
  });

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
     * 3. Load latest product data.
     */
    const productIds = cart.items.map((item) => item.product);

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
    }).session(session);

    /*
     * 4. Validate products, stock and
     * calculate server-authoritative pricing.
     */
    const { items: orderItems, pricing } = cartPricingService.buildCartSummary({
      cart,
      products,
    });

    /*
     * 5. Snapshot delivery address.
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
     * 6. Create order.
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

          pricing,

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
     * 7. Atomically reduce inventory.
     */
    for (const cartItem of cart.items) {
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
     * 8. Clear cart.
     */
    cart.items = [];

    await cart.save({
      session,
    });

    /*
     * 9. Commit transaction.
     */
    await session.commitTransaction();

    sendSellerNewOrderEmail(order).catch((error) => {
      console.error("Seller order email failed:", error);
    });

    return order;
  } catch (error) {
    /*
     * Abort only if the transaction
     * is still active.
     */
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    /*
     * MongoDB duplicate-key error.
     *
     * Another request with the same
     * idempotency key may have completed
     * concurrently.
     */
    if (error?.code === 11000) {
      const existingOrder = await Order.findOne({
        user: userId,

        idempotencyKey: normalizedIdempotencyKey,
      });

      if (existingOrder) {
        return existingOrder;
      }
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

const placeOnlineOrder = async ({ userId, addressId, idempotencyKey }) => {
  /*
   * ============================================
   * 1. Validate request
   * ============================================
   */

  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(400, "Invalid address ID");
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
   * 2. Fast idempotency check
   * ============================================
   */

  const existingOrder = await Order.findOne({
    user: userId,
    idempotencyKey: normalizedIdempotencyKey,
  });

  if (existingOrder) {
    /*
     * If payment order has already
     * been initialized, return it.
     */

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

    /*
     * An order exists but Razorpay
     * initialization hasn't completed.
     *
     * Don't create another order.
     */
    throw new ApiError(409, "Your payment is already being initialized. Please try again.");
  }

  /*
   * ============================================
   * 3. Load address and cart
   * ============================================
   *
   * We do this before creating the
   * Razorpay order so the amount is
   * calculated entirely by our backend.
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
   * 4. Load latest product information
   * ============================================
   */

  const productIds = cart.items.map((item) => item.product);

  const products = await Product.find({
    _id: {
      $in: productIds,
    },

    isActive: true,

    isArchived: false,
  });

  /*
   * ============================================
   * 5. Server-authoritative pricing
   * ============================================
   */

  const { items: orderItems, pricing } = cartPricingService.buildCartSummary({
    cart,
    products,
  });

  if (!pricing || !Number.isFinite(pricing.grandTotal) || pricing.grandTotal <= 0) {
    throw new ApiError(400, "Invalid order amount.");
  }

  /*
   * ============================================
   * 6. Generate our order number
   * ============================================
   */

  const orderNumber = generateOrderNumber();

  /*
   * ============================================
   * 7. Create Razorpay Order
   * ============================================
   *
   * IMPORTANT:
   *
   * The amount comes from our backend,
   * never from the frontend.
   */

  const razorpayOrder = await createRazorpayOrder({
    orderId: orderNumber,

    amount: pricing.grandTotal,
  });

  /*
   * ============================================
   * 8. Create DB order + reserve stock
   * ============================================
   */

  const session = await mongoose.startSession();

  let order;

  try {
    session.startTransaction();

    /*
     * Re-check idempotency inside
     * transaction.
     *
     * This protects against two
     * concurrent checkout requests.
     */
    const concurrentOrder = await Order.findOne({
      user: userId,

      idempotencyKey: normalizedIdempotencyKey,
    }).session(session);

    if (concurrentOrder) {
      await session.abortTransaction();

      /*
       * The Razorpay order we created
       * for this losing request is now
       * unused.
       *
       * We simply don't attach it to
       * the existing order.
       */
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
     * 9. Re-load cart inside transaction
     * ========================================
     *
     * The cart may have changed while
     * Razorpay order was being created.
     */

    const currentCart = await Cart.findOne({
      user: userId,
    }).session(session);

    if (!currentCart || currentCart.items.length === 0) {
      throw new ApiError(400, "Your cart is empty.");
    }

    /*
     * Make sure the cart used for the
     * Razorpay amount is still the same.
     */
    const currentProductIds = currentCart.items.map((item) => item.product);

    const currentProducts = await Product.find({
      _id: {
        $in: currentProductIds,
      },

      isActive: true,

      isArchived: false,
    }).session(session);

    const { items: currentOrderItems, pricing: currentPricing } =
      cartPricingService.buildCartSummary({
        cart: currentCart,
        products: currentProducts,
      });

    /*
     * Prevent paying an amount calculated
     * from a cart that changed while the
     * Razorpay order was being created.
     */
    if (currentPricing.grandTotal !== pricing.grandTotal) {
      throw new ApiError(409, "Your cart changed. Please refresh checkout and try again.");
    }

    /*
     * ========================================
     * 10. Snapshot shipping address
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
     * 11. Reserve inventory
     * ========================================
     */

    for (const cartItem of currentCart.items) {
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
     * 12. Create our DB order
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

          pricing: currentPricing,

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
     * 13. Commit transaction
     * ========================================
     */

    await session.commitTransaction();
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    /*
     * The Razorpay order exists,
     * but our DB transaction failed.
     *
     * It will remain unused and no
     * customer-facing order will be
     * created.
     */

    if (error?.code === 11000) {
      const existingOrder = await Order.findOne({
        user: userId,

        idempotencyKey: normalizedIdempotencyKey,
      });

      if (existingOrder) {
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
      }
    }

    throw error;
  } finally {
    await session.endSession();
  }

  /*
   * ============================================
   * 14. Return checkout information
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

    [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED],

    [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],

    [ORDER_STATUS.DELIVERED]: [],

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

  const changedAt = new Date();

  order.orderStatus = status;

  order.statusHistory.push({
    status,
    timestamp: changedAt,
  });

  if (status === ORDER_STATUS.DELIVERED) {
    order.deliveredAt = changedAt;

    /*
     * COD becomes paid when delivered.
     */
    if (order.paymentMethod === "COD") {
      order.paymentStatus = "PAID";
    }
  }

  await order.save();

  return order.populate("user", "displayName username email phone");
};

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
  getOrderById,
  getUserOrders,
  cancelOrder,
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  cancelAdminOrder,
};

export default orderService;
