import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import addressService from "../services/address.service.js";

export const createAddress = asyncHandler(async (req, res) => {
  const address = await addressService.createAddress(req.user._id, req.body);

  return res.status(201).json(new ApiResponse(201, "Address created successfully.", address));
});

export const getUserAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getUserAddresses(req.user._id);

  return res.status(200).json(new ApiResponse(200, "Addresses fetched successfully.", addresses));
});

export const getAddressById = asyncHandler(async (req, res) => {
  const address = await addressService.getAddressById(req.user._id, req.params.id);

  return res.status(200).json(new ApiResponse(200, "Address fetched successfully.", address));
});

export const updateAddress = asyncHandler(async (req, res) => {
  const address = await addressService.updateAddress(req.user._id, req.params.id, req.body);

  return res.status(200).json(new ApiResponse(200, "Address updated successfully.", address));
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const result = await addressService.deleteAddress(req.user._id, req.params.id);

  return res.status(200).json(new ApiResponse(200, result.message));
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await addressService.setDefaultAddress(req.user._id, req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Default address updated successfully.", address));
});

export default {
  createAddress,
  getUserAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
