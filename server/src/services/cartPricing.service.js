import ApiError from "../utils/ApiError.js";

/*
 * --------------------------------
 * Calculate GST included in price
 * --------------------------------
 *
 * Product price is GST-inclusive.
 *
 * Example:
 * ₹118 @ 18% GST
 *
 * Taxable value = 118 / 1.18
 * GST           = 118 - taxable value
 */

const calculateIncludedTax = (amount, taxRate) => {
  if (!amount || !taxRate) {
    return 0;
  }

  return amount - amount / (1 + taxRate / 100);
};

const buildCartSummary = ({ cart, products }) => {
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  const items = [];

  let itemsTotal = 0;
  let discount = 0;
  let tax = 0;

  for (const cartItem of cart.items) {
    const product = productMap.get(cartItem.product.toString());

    if (!product) {
      throw new ApiError(400, "One or more products in your cart are no longer available");
    }

    if (!product.isActive) {
      throw new ApiError(400, `${product.name} is no longer available`);
    }

    if (product.stock <= 0) {
      throw new ApiError(400, `${product.name} is currently out of stock`);
    }

    if (product.stock < cartItem.quantity) {
      throw new ApiError(400, `Only ${product.stock} units of ${product.name} are available`);
    }

    const quantity = cartItem.quantity;

    /*
     * --------------------------------
     * Selling price
     * --------------------------------
     */

    const subtotal = product.price * quantity;

    /*
     * --------------------------------
     * Discount
     * --------------------------------
     *
     * comparePrice is treated as MRP /
     * original price.
     *
     * Discount is informational because
     * product.price is already the discounted
     * selling price.
     */

    const originalSubtotal =
      Math.max(Number(product.comparePrice || 0), Number(product.price || 0)) * quantity;

    const itemDiscount = Math.max(0, originalSubtotal - subtotal);

    /*
     * --------------------------------
     * GST
     * --------------------------------
     *
     * GST is already included in product.price.
     */

    const taxRate = Number(product.tax?.rate || 0);

    const itemTax = calculateIncludedTax(subtotal, taxRate);

    /*
     * --------------------------------
     * Accumulate totals
     * --------------------------------
     */

    itemsTotal += subtotal;

    discount += itemDiscount;

    tax += itemTax;

    /*
     * --------------------------------
     * Order item snapshot
     * --------------------------------
     */

    items.push({
      product: product._id,

      name: product.name,

      slug: product.slug,

      sku: product.sku,

      image: product.images?.[0]?.url || "",

      price: product.price,

      comparePrice: product.comparePrice || 0,

      quantity,

      subtotal,

      discount: itemDiscount,

      tax: itemTax,

      taxRate,
    });
  }

  /*
   * Shipping is calculated separately.
   */

  const shippingFee = 0;

  /*
   * IMPORTANT:
   *
   * price already contains the discount
   * and GST.
   *
   * Therefore neither tax nor discount
   * is added/subtracted again.
   */

  const grandTotal = itemsTotal + shippingFee;

  return {
    items,

    pricing: {
      itemsTotal: Number(itemsTotal.toFixed(2)),

      shippingFee,

      discount: Number(discount.toFixed(2)),

      tax: Number(tax.toFixed(2)),

      grandTotal: Number(grandTotal.toFixed(2)),
    },
  };
};

const cartPricingService = {
  buildCartSummary,
};

export default cartPricingService;
