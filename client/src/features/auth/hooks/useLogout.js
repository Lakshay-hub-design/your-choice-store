"use client";

import { useRouter } from "next/navigation";

import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";

import { logoutCustomer } from "@/features/auth/services/authService";

export default function useLogout() {
  const router = useRouter();

  const clearAuth = useAuthStore((state) => state.clearAuth);

  const logout = async () => {
    try {
      await logoutCustomer();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      useCartStore.getState().resetCart();

      useWishlistStore.getState().resetWishlist();

      clearAuth();

      router.replace("/login");
      router.refresh();
    }
  };

  return logout;
}
