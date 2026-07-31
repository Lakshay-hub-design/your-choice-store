import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import adminDashboardService from "../services/adminDashboard.service.js";

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await adminDashboardService.getDashboard();

  return res.status(200).json(new ApiResponse(200, "Dashboard fetched successfully", dashboard));
});

const adminDashboardController = {
  getDashboard,
};

export default adminDashboardController;
