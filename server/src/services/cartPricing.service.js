import ApiError from "../utils/ApiError.js";

const buildCartSummary = ({ cart, products }) => {
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  const items = [];

  let itemsTotal = 0;

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

    const subtotal = product.price * cartItem.quantity;

    itemsTotal += subtotal;

    items.push({
      product: product._id,

      name: product.name,

      slug: product.slug,

      sku: product.sku,

      image: product.images?.[0]?.url || "",

      price: product.price,

      quantity: cartItem.quantity,

      subtotal,
    });
  }

  // Temporary pricing rules.
  // We'll replace these when shipping,
  // coupons and tax calculations are built.
  const shippingFee = 0;
  const discount = 0;
  const tax = 0;

  const grandTotal = itemsTotal + shippingFee + tax - discount;

  return {
    items,

    pricing: {
      itemsTotal,
      shippingFee,
      discount,
      tax,
      grandTotal,
    },
  };
};

const cartPricingService = {
  buildCartSummary,
};

export default cartPricingService;
