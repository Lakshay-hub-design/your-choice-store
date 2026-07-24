import { create } from "zustand";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "@/features/wishlist/services/wishlistService";

const useWishlistStore = create((set, get) => ({
  wishlist: null,

  isLoading: false,
  isInitialized: false,

  error: null,

  fetchWishlist: async () => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const response = await getWishlist();

      const wishlist = response.data?.data ?? null;

      set({
        wishlist,
        isInitialized: true,
        error: null,
      });

      return {
        success: true,
        wishlist,
      };
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load wishlist.";

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

  addItem: async (productId) => {
    try {
      const response = await addToWishlist(productId);

      const wishlist = response.data?.data ?? null;

      set({
        wishlist,
        error: null,
      });

      return {
        success: true,
        wishlist,
      };
    } catch (error) {
      const message = error.response?.data?.message || "Unable to add product to wishlist.";

      return {
        success: false,
        message,
      };
    }
  },

  removeItem: async (productId) => {
    try {
      const response = await removeFromWishlist(productId);

      const wishlist = response.data?.data ?? null;

      set({
        wishlist,
        error: null,
      });

      return {
        success: true,
        wishlist,
      };
    } catch (error) {
      const message = error.response?.data?.message || "Unable to remove product from wishlist.";

      return {
        success: false,
        message,
      };
    }
  },

  clearAllItems: async () => {
    try {
      const response = await clearWishlist();

      const wishlist = response.data?.data ?? null;

      set({
        wishlist,
        error: null,
      });

      return {
        success: true,
        wishlist,
      };
    } catch (error) {
      const message = error.response?.data?.message || "Unable to clear wishlist.";

      return {
        success: false,
        message,
      };
    }
  },

  isInWishlist: (productId) => {
    const wishlist = get().wishlist;

    if (!wishlist || !Array.isArray(wishlist.items)) {
      return false;
    }

    return wishlist.items.some(
      (item) => item.product?._id === productId || item.product === productId
    );
  },

  resetWishlist: () => {
    set({
      wishlist: null,
      error: null,
      isLoading: false,
      isInitialized: false,
    });
  },
}));

export default useWishlistStore;
