import api from "@/lib/axios";

export const getAdminProducts = async (filters = {}) => {
  const response = await api.get("/admin/products", {
    params: filters,
  });

  return response.data?.data;
};

export const createAdminProduct = async (formData) => {
  const response = await api.post("/admin/products", formData);

  return response.data?.data;
};

export const getAdminProductById = async (productId) => {
  const response = await api.get(`/admin/products/${productId}`);

  return response.data?.data;
};

export const updateAdminProduct = async (productId, formData) => {
  const response = await api.patch(`/admin/products/${productId}`, formData);

  return response.data?.data;
};

export const updateAdminProductStatus = async (productId, isActive) => {
  const response = await api.patch(`/admin/products/${productId}/status`, {
    isActive,
  });

  return response.data?.data;
};

export const archiveAdminProduct = async (productId) => {
  const response = await api.patch(`/admin/products/${productId}/archive`);

  return response.data?.data;
};

export const restoreAdminProduct = async (productId) => {
  const response = await api.patch(`/admin/products/${productId}/restore`);

  return response.data?.data;
};
