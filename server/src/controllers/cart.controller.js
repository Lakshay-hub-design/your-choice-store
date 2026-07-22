import cartService from "../services/cart.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getUserCart(req.user._id);

  return res.status(200).json(new ApiResponse(200, "Fetched cart succesfully", cart));
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const cart = await cartService.addItemToCart({
    userId: req.user._id,
    productId,
    quantity,
  });

  return res.status(200).json(new ApiResponse(200, "Product added to cart", cart));
});

const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItemQuantity({
    userId: req.user._id,
    productId: req.params.productId,
    quantity: req.body.quantity,
  });

  return res.status(200).json(new ApiResponse(200, "Cart updated succesfully", cart));
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItemFromCart({
    userId: req.user._id,
    productId: req.params.productId,
  });

  return res.status(200).json(new ApiResponse(200, "Product removed from cart", cart));
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearUserCart(req.user._id);

  return res.status(200).json(new ApiResponse(200, "Cart cleared succesfully", cart));
});

export { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
