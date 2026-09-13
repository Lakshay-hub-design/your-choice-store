import ApiError from "../utils/ApiError.js";
import shippingService from "../features/shipping/services/shipping.service.js";
import asyncHandler from "../utils/asyncHandler.js";

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

export { getAvailableCouriers, assignCourier };
