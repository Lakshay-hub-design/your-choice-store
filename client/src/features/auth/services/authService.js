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
  const response = await api.post("/auth/resend-verification-email", {
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

export const changeCustomerPassword = async (data) => {
  const response = await api.patch("/auth/change-password", data);
  return response.data;
};

export const logoutCustomer = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateCustomerProfile = async (data) => {
  const formData = new FormData();

  if (data.fullName !== undefined) {
    formData.append("fullName", data.fullName);
  }

  if (data.phone !== undefined) {
    formData.append("phone", data.phone);
  }

  if (data.avatar) {
    formData.append("avatar", data.avatar);
  }

  const response = await api.patch("/auth/profile", formData);

  return response.data;
};
