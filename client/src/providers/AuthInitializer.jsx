"use client";

import { useEffect } from "react";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";

export default function AuthInitializer() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const clearAuth = useAuthStore((state) => state.clearAuth);

  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const refreshResponse = await api.post("/auth/refresh-token");

        const accessToken = refreshResponse.data.data.accessToken;

        useAuthStore.getState().setAccessToken(accessToken);

        const userResponse = await api.get("/auth/me");

        const user = userResponse.data.data;

        setAuth(user, accessToken);
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setAuth, clearAuth, setLoading]);

  return null;
}
