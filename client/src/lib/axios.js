import axios from "axios";
import useAuthStore from "@/store/authStore";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Separate instance: refresh requests must not pass through
// the main response interceptor.
const refreshApi = axios.create({
  baseURL,
  withCredentials: true,
});

// Shared promise prevents multiple simultaneous refresh requests.
let refreshPromise = null;

const authEndpoints = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/resend-verification-email",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh-token",
  "/auth/logout",
];

const isAuthEndpoint = (url = "") => {
  const pathname = url.split("?")[0].replace(/\/+$/, "");

  return authEndpoints.some((endpoint) => pathname.endsWith(endpoint));
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshApi
      .post("/auth/refresh-token")
      .then((response) => {
        const newAccessToken = response.data.data.accessToken;

        useAuthStore.getState().setAccessToken(newAccessToken);

        return newAccessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// Attach access token to outgoing requests.
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired access tokens.
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
        const newAccessToken = await refreshAccessToken();

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        const status = refreshError.response?.status;

        if (status === 401 || status === 403) {
          useAuthStore.getState().clearAuth();
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
