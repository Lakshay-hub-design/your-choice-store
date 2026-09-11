import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";

import ApiError from "../utils/ApiError.js";

import cartPricingService from "./cartPricing.service.js";
import shippingService from "../features/shipping/services/shipping.service.js";

const getCheckoutSummary = async ({ userId, addressId = null, paymentMethod = "ONLINE" }) => {
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
  }).select("name slug sku price comparePrice stock images isActive shipping tax");

  const { items, pricing } = cartPricingService.buildCartSummary({
    cart,
    products,
  });

  const defaultAddress = addresses.find((address) => address.isDefault) || null;

  /*
   * --------------------------------
   * Determine address for shipping
   * --------------------------------
   */

  let shippingAddress = null;

  if (addressId) {
    shippingAddress = addresses.find((address) => address._id.toString() === addressId.toString());

    if (!shippingAddress) {
      throw new ApiError(404, "Selected address not found.");
    }
  } else {
    /*
     * If no address was explicitly selected,
     * use the default address.
     */
    shippingAddress = defaultAddress;
  }

  /*
   * --------------------------------
   * Calculate shipping
   * --------------------------------
   *
   * We only calculate a Shiprocket quote
   * when an address is available.
   *
   * This allows checkout to load even when
   * the customer has not selected an address.
   */

  let shippingQuote = null;

  if (shippingAddress) {
    shippingQuote = await shippingService.getShippingQuote({
      products,
      cart,
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

    grandTotal: pricing.itemsTotal + shippingFee,
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
