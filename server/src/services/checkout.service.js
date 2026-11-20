import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";

import ApiError from "../utils/ApiError.js";

import cartPricingService from "./cartPricing.service.js";
import shippingService from "../features/shipping/services/shipping.service.js";

const getCheckoutSummary = async ({
  userId,
  addressId = null,
  paymentMethod = "ONLINE",
  productId = null,
}) => {
  const [cart, addresses] = await Promise.all([
    Cart.findOne({ user: userId }),

    Address.find({ user: userId }).sort({
      isDefault: -1,
      createdAt: -1,
    }),
  ]);

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  /*
   * --------------------------------
   * Select cart items
   * --------------------------------
   *
   * productId is optional:
   * - null: checkout the entire cart
   * - provided: checkout only that product
   */

  let selectedCartItems = cart.items;

  if (productId) {
    selectedCartItems = cart.items.filter(
      (item) => item.product.toString() === productId.toString()
    );

    if (selectedCartItems.length === 0) {
      throw new ApiError(400, "Selected product is not in your cart.");
    }
  }

  // Create a separate cart object without modifying the original cart.
  const checkoutCart = {
    ...cart.toObject(),
    items: selectedCartItems,
  };

  /*
   * --------------------------------
   * Fetch selected products
   * --------------------------------
   */

  const productIds = selectedCartItems.map((item) => item.product);

  const products = await Product.find({
    _id: {
      $in: productIds,
    },
  }).select("name slug sku price comparePrice stock images isActive shipping tax");

  /*
   * --------------------------------
   * Calculate pricing
   * --------------------------------
   */

  const { items, pricing } = cartPricingService.buildCartSummary({
    cart: checkoutCart,
    products,
  });

  const defaultAddress = addresses.find((address) => address.isDefault) || null;

  /*
   * --------------------------------
   * Determine shipping address
   * --------------------------------
   */

  let shippingAddress = null;

  if (addressId) {
    shippingAddress = addresses.find((address) => address._id.toString() === addressId.toString());

    if (!shippingAddress) {
      throw new ApiError(404, "Selected address not found.");
    }
  } else {
    shippingAddress = defaultAddress;
  }

  /*
   * --------------------------------
   * Calculate shipping
   * --------------------------------
   */

  let shippingQuote = null;

  if (shippingAddress) {
    shippingQuote = await shippingService.getShippingQuote({
      products,
      cart: checkoutCart,
      deliveryPostcode: shippingAddress.postalCode,
      paymentMethod,
    });
  }

  /*
   * --------------------------------
   * Apply shipping fee
   * --------------------------------
   */

  const shippingFee = shippingQuote?.shippingFee || 0;

  const finalPricing = {
    ...pricing,
    shippingFee,
    grandTotal: Number((pricing.itemsTotal + shippingFee).toFixed(2)),
  };

  return {
    items,
    addresses,
    defaultAddress,
    selectedAddress: shippingAddress,
    shipping: shippingQuote,
    pricing: finalPricing,
  };
};

const checkoutService = {
  getCheckoutSummary,
};

export default checkoutService;
