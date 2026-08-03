import customerAdminService from "../services/customer.admin.service.js";

import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getAdminCustomers = asyncHandler(async (req, res) => {
  const customers = await customerAdminService.getAdminCustomers(req.query);

  return res.status(200).json(new ApiResponse(200, "Customers fetched successfully", customers));
});

const toggleCustomerStatus = asyncHandler(async (req, res) => {
  const customer = await customerAdminService.toggleCustomerStatus(req.params.id);

  return res.status(200).json(new ApiResponse(200, "Customer status updated.", customer));
});

const archiveCustomer = asyncHandler(async (req, res) => {
  const customer = await customerAdminService.archiveCustomer(req.params.id);

  return res.status(200).json(new ApiResponse(200, "Customer archived.", customer));
});

const restoreCustomer = asyncHandler(async (req, res) => {
  const customer = await customerAdminService.restoreCustomer(req.params.id);

  return res.status(200).json(new ApiResponse(200, "Customer restored.", customer));
});

const getAdminCustomerById = asyncHandler(async (req, res) => {
  const customer = await customerAdminService.getAdminCustomerById(req.params.id);

  return res.status(200).json(new ApiResponse(200, "Customer fetched successfully", customer));
});

export {
  getAdminCustomers,
  toggleCustomerStatus,
  archiveCustomer,
  restoreCustomer,
  getAdminCustomerById,
};
