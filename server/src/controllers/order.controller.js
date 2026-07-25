import orderService from "../services/order.service.js";

import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const placeOrder = asyncHandler(async (req, res) => {
  const { addressId, paymentMethod } = req.body;

  let order;

  switch (paymentMethod) {
    case "COD":
      order = await orderService.placeCODOrder({
        userId: req.user._id,

        addressId,
      });

      break;

    default:
      throw new Error("Unsupported payment method");
  }

  return res.status(201).json(new ApiResponse(201, "Order placed successfully", order));
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

export { placeOrder, getOrderById, getUserOrders };
