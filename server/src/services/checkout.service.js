import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";

import ApiError from "../utils/ApiError.js";

import cartPricingService from "./cartPricing.service.js";

const getCheckoutSummary = async (userId) => {
  const [cart, addresses] = await Promise.all([
    Cart.findOne({
      user: userId,
    }),

    Address.find({
      user: userId,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    }),
  ]);

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  const productIds = cart.items.map((item) => item.product);

  const products = await Product.find({
    _id: {
      $in: productIds,
    },
  }).select("name slug sku price comparePrice stock images isActive");

  const { items, pricing } = cartPricingService.buildCartSummary({
    cart,
    products,
  });

  const defaultAddress = addresses.find((address) => address.isDefault) || null;

  return {
    items,
    addresses,
    defaultAddress,
    pricing,
  };
};

const checkoutService = {
  getCheckoutSummary,
};

export default checkoutService;
