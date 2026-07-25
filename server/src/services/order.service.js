import mongoose from "mongoose";

import Order, { ORDER_STATUS } from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";

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
const placeCODOrder = async ({ userId, addressId }) => {
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(400, "Invalid address ID");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    /*
     * 1. Validate the selected address.
     *
     * We include userId so a customer
     * cannot use another customer's address.
     */
    const address = await Address.findOne({
      _id: addressId,
      user: userId,
    }).session(session);

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    /*
     * 2. Get the customer's cart.
     */
    const cart = await Cart.findOne({
      user: userId,
    }).session(session);

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Your cart is empty");
    }

    /*
     * 3. Load the latest product data.
     */
    const productIds = cart.items.map((item) => item.product);

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
    }).session(session);

    /*
     * 4. Validate products, stock and
     * calculate trusted server-side pricing.
     *
     * This same service is used by
     * GET /checkout.
     */
    const { items: orderItems, pricing } = cartPricingService.buildCartSummary({
      cart,
      products,
    });

    /*
     * 5. Create a snapshot of the
     * delivery address.
     *
     * Future changes to the customer's
     * saved address won't affect this order.
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
     * 6. Create the order.
     */
    const placedAt = new Date();

    const [order] = await Order.create(
      [
        {
          orderNumber: generateOrderNumber(),

          user: userId,

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
     * 7. Atomically reduce stock
     * and increase sold count.
     *
     * The stock condition protects us
     * if inventory changes while the
     * customer is placing the order.
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
     * 8. Clear the customer's cart.
     */
    cart.items = [];

    await cart.save({
      session,
    });

    /*
     * 9. Everything succeeded.
     */
    await session.commitTransaction();

    return order;
  } catch (error) {
    /*
     * Order creation, stock changes
     * and cart clearing are all rolled
     * back if anything fails.
     */
    await session.abortTransaction();

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

const orderService = {
  placeCODOrder,
  getOrderById,
  getUserOrders,
};

export default orderService;
