import checkoutService from "../services/checkout.service.js";

import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getCheckoutSummary = asyncHandler(async (req, res) => {
  const checkout = await checkoutService.getCheckoutSummary(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Checkout summary fetched successfully", checkout));
});

export { getCheckoutSummary };
