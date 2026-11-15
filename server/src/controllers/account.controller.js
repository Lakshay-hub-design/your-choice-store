import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import accountService from "../services/account.service.js";

export const getAccountSummary = asyncHandler(async (req, res) => {
  const summary = await accountService.getAccountSummary(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Account summary fetched successfully", summary));
});
