import checkoutService from "../services/checkout.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getCheckoutSummary = asyncHandler(async (req, res) => {
  const { addressId, paymentMethod, productId } = req.query;

  const checkout = await checkoutService.getCheckoutSummary({
    userId: req.user._id,
    addressId: addressId || null,
    paymentMethod: paymentMethod || "ONLINE",
    productId: productId || null,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Checkout summary fetched successfully", checkout));
});

export { getCheckoutSummary };
