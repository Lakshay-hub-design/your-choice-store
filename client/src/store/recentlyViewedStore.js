import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT_PRODUCTS = 10;

const useRecentlyViewedStore = create(
  persist(
    (set) => ({
      products: [],

      addRecentlyViewed: (product) => {
        if (!product?._id) return;

        const productSnapshot = {
          _id: product._id,

          name: product.name,
          slug: product.slug,

          price: product.price,
          comparePrice: product.comparePrice,

          stock: product.stock,

          images: product.images || [],

          averageRating: product.averageRating || 0,

          numReviews: product.numReviews || 0,

          isBestSeller: product.isBestSeller || false,

          customization: product.customization || {
            enabled: false,
          },
        };

        set((state) => {
          const filteredProducts = state.products.filter((item) => item._id !== product._id);

          return {
            products: [productSnapshot, ...filteredProducts].slice(0, MAX_RECENT_PRODUCTS),
          };
        });
      },

      clearRecentlyViewed: () => {
        set({
          products: [],
        });
      },
    }),
    {
      name: "yc-recently-viewed",
    }
  )
);

export default useRecentlyViewedStore;
