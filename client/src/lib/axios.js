import axios from "axios";

import useAuthStore from "@/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

const isAuthEndpoint = (url = "") => {
  const authEndpoints = [
    "/auth/login",
    "/auth/register",
    "/auth/verify-email",
    "/auth/resend-verification",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/refresh-token",
    "/auth/logout",
  ];

  return authEndpoints.some((endpoint) => url.includes(endpoint));
};

api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const response = await api.post("/auth/refresh-token");

        const newAccessToken = response.data.data.accessToken;

        useAuthStore.getState().setAccessToken(newAccessToken);

        originalRequest.headers = originalRequest.headers || {};

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
