import mongoose from "mongoose";

import Order, { ORDER_STATUS } from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import Review from "../models/Review.js";

import ApiError from "../utils/ApiError.js";

import cartPricingService from "./cartPricing.service.js";

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

  return order;
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
  getOrderById,
  getUserOrders,
  cancelOrder,
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  cancelAdminOrder,
};

export default orderService;
