import { create } from "zustand";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/features/cart/services/cartService";

const useCartStore = create((set, get) => ({
  cart: null,

  isLoading: false,
  isInitialized: false,

  error: null,

  fetchCart: async () => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const response = await getCart();

      const cart = response.data || null;

      set({
        cart,
        error: null,
        isInitialized: true,
      });

      return {
        success: true,
        cart,
      };
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load cart.";

      set({
        error: message,
        isInitialized: true,
      });

      return {
        success: false,
        message,
      };
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  addItem: async (productId, quantity = 1) => {
    try {
      const response = await addToCart(productId, quantity);

      const cart = response.data;

      set({
        cart,
        error: null,
      });

      return {
        success: true,
        cart,
      };
    } catch (error) {
      return {
        success: false,

        message: error.response?.data?.message || "Unable to add product to cart.",
      };
    }
  },

  updateQuantity: async (productId, quantity) => {
    try {
      const response = await updateCartItem(productId, quantity);

      const cart = response.data;

      set({
        cart,
        error: null,
      });

      return {
        success: true,
        cart,
      };
    } catch (error) {
      return {
        success: false,

        message: error.response?.data?.message || "Unable to update quantity.",
      };
    }
  },

  removeItem: async (productId) => {
    try {
      const response = await removeCartItem(productId);

      const cart = response.data?.cart ?? response.data;

      set({
        cart,
        error: null,
      });

      return {
        success: true,
        cart,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Unable to remove product.",
      };
    }
  },

  clearAllItems: async () => {
    try {
      const response = await clearCart();

      const cart = response.data;

      set({
        cart,
        error: null,
      });

      return {
        success: true,
        cart,
      };
    } catch (error) {
      return {
        success: false,

        message: error.response?.data?.message || "Unable to clear cart.",
      };
    }
  },

  resetCart: () => {
    set({
      cart: null,
      error: null,
      isLoading: false,
      isInitialized: false,
    });
  },
}));

export default useCartStore;
