"use client";

import { useEffect } from "react";

import useAuthStore from "@/store/authStore";
import useWishlistStore from "@/store/wishlistStore";

export default function WishlistInitializer() {
  const user = useAuthStore((state) => state.user);

  const isAuthLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    const { fetchWishlist, resetWishlist } = useWishlistStore.getState();

    if (user) {
      fetchWishlist();
    } else {
      resetWishlist();
    }
  }, [user, isAuthLoading]);

  return null;
}
