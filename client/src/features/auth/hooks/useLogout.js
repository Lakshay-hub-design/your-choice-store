"use client";

import { useRouter } from "next/navigation";

import useAuthStore from "@/store/authStore";
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
      clearAuth();

      router.replace("/login");
      router.refresh();
    }
  };

  return logout;
}
