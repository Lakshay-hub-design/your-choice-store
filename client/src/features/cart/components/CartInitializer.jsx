"use client";

import { useEffect } from "react";

import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";

export default function CartInitializer() {
  const user = useAuthStore((state) => state.user);

  const isAuthLoading = useAuthStore((state) => state.isLoading);

  const isCartInitialized = useCartStore((state) => state.isInitialized);

  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    // Wait for auth initialization
    if (isAuthLoading) {
      return;
    }

    // Don't fetch cart for guests
    if (!user) {
      return;
    }

    // Don't fetch again
    if (isCartInitialized) {
      return;
    }

    fetchCart();
  }, [user, isAuthLoading, isCartInitialized, fetchCart]);

  return null;
}
