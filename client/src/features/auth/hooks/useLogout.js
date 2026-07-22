"use client";

import { useRouter } from "next/navigation";

import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";

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
      // Clear authentication state
      clearAuth();

      // Clear previous user's cart
      useCartStore.getState().resetCart();

      router.replace("/login");

      router.refresh();
    }
  };

  return logout;
}
