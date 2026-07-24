import wishlistService from "../services/wishlist.service.js";

import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.getUserWishlist(req.user._id);

  return res.status(200).json(new ApiResponse(200, "Wishlist fetched successfully", wishlist));
});

const addToWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.addItemToWishlist({
    userId: req.user._id,
    productId: req.params.productId,
  });

  return res.status(200).json(new ApiResponse(200, "Product added to wishlist", wishlist));
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.removeItemFromWishlist({
    userId: req.user._id,
    productId: req.params.productId,
  });

  return res.status(200).json(new ApiResponse(200, "Product removed from wishlist", wishlist));
});

const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.clearUserWishlist(req.user._id);

  return res.status(200).json(new ApiResponse(200, "Wishlist cleared successfully", wishlist));
});

export { getWishlist, addToWishlist, removeFromWishlist, clearWishlist };
