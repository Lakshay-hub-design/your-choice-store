import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";

const MAX_CART_QUANTITY = 20;

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  return cart;
};

const getUserCart = async (userId) => {
  const cart = await getOrCreateCart(userId);

  await cart.populate({
    path: "items.product",
    select: "name slug price comparePrice images stock isActive",
  });

  return cart;
};

const addItemToCart = async ({ userId, productId, quantity }) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.isActive === false) {
    throw new ApiError(400, "This product is currently unavailable");
  }

  if (product.stock <= 0) {
    throw new ApiError(400, "Product is out of stock");
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = cart.items.find((item) => item.product.toString() === productId);

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > MAX_CART_QUANTITY) {
      throw new ApiError(400, `Maximum ${MAX_CART_QUANTITY} units allowed per product`);
    }

    if (newQuantity > product.stock) {
      throw new ApiError(400, `Only ${product.stock} units are available`);
    }

    existingItem.quantity = newQuantity;
  } else {
    if (quantity > product.stock) {
      throw new ApiError(400, `Only ${product.stock} units are available`);
    }

    cart.items.push({
      product: productId,
      quantity,
    });
  }

  await cart.save();

  return getUserCart(userId);
};

const updateItemQuantity = async ({ userId, productId, quantity }) => {
  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const cartItem = cart.items.find((item) => item.product.toString() === productId);

  if (!cartItem) {
    throw new ApiError(404, "Product not found in cart");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product no longer exists");
  }

  if (product.isActive === false) {
    throw new ApiError(400, "This product is currently unavailable");
  }

  if (quantity > MAX_CART_QUANTITY) {
    throw new ApiError(400, `Maximum ${MAX_CART_QUANTITY} units allowed per product`);
  }

  if (quantity > product.stock) {
    throw new ApiError(400, `Only ${product.stock} units are available`);
  }

  cartItem.quantity = quantity;

  await cart.save();

  return getUserCart(userId);
};

const removeItemFromCart = async ({ userId, productId }) => {
  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const itemExists = cart.items.some((item) => item.product.toString() === productId);

  if (!itemExists) {
    throw new ApiError(404, "Product not found in cart");
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);

  await cart.save();

  return getUserCart(userId);
};

const clearUserCart = async (userId) => {
  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    return getOrCreateCart(userId);
  }

  cart.items = [];

  await cart.save();

  return cart;
};

const cartService = {
  getOrCreateCart,
  getUserCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearUserCart,
};

export default cartService;
