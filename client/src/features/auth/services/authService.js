import api from "@/lib/axios";

export const registerCustomer = async (data) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);

  return response.data;
};

export const resendVerificationEmail = async (email) => {
  const response = await api.post("/auth/resend-verification", {
    email,
  });

  return response.data;
};

export const loginCustomer = async (data) => {
  const response = await api.post("/auth/login", data);

  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.post("/auth/reset-password", {
    token,
    password,
  });

  return response.data;
};

export const logoutCustomer = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};
