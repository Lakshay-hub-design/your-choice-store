const EMPTY_CART_ITEMS = [];

export const selectCartItems = (state) => {
  return state.cart?.items ?? EMPTY_CART_ITEMS;
};

export const selectCartCount = (state) => {
  const items = state.cart?.items ?? EMPTY_CART_ITEMS;

  return items.reduce((total, item) => total + item.quantity, 0);
};

export const selectUniqueCartItems = (state) => {
  return state.cart?.items?.length ?? 0;
};

export const selectCartSubtotal = (state) => {
  const items = state.cart?.items ?? EMPTY_CART_ITEMS;

  return items.reduce((total, item) => {
    const price = item.product?.price ?? 0;

    return total + price * item.quantity;
  }, 0);
};

export const selectCartSavings = (state) => {
  const items = state.cart?.items ?? EMPTY_CART_ITEMS;

  return items.reduce((total, item) => {
    const price = item.product?.price ?? 0;

    const comparePrice = item.product?.comparePrice ?? 0;

    if (comparePrice <= price) {
      return total;
    }

    return total + (comparePrice - price) * item.quantity;
  }, 0);
};
