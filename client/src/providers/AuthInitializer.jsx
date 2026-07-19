"use client";

import { useEffect } from "react";

import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";

export default function AuthInitializer() {
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const { setAccessToken, setUser, clearAuth, setLoading } = useAuthStore.getState();

      try {
        const refreshResponse = await api.post("/auth/refresh-token");

        const accessToken = refreshResponse.data.data.accessToken;

        if (!isMounted) return;

        setAccessToken(accessToken);

        const userResponse = await api.get("/auth/me");

        if (!isMounted) return;

        const user = userResponse.data.data;

        setUser(user);
      } catch {
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}
