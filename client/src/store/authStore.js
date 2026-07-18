import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
    }),

  setUser: (user) =>
    set({
      user,
    }),

  setAccessToken: (accessToken) =>
    set({
      accessToken,
    }),

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
    }),
}));

export default useAuthStore;
