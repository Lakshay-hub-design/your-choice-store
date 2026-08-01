import api from "@/lib/axios";

export const getAdminCategories = async (params = {}) => {
  const response = await api.get("/admin/categories/admin-categories", {
    params,
  });

  return response.data.data;
};

export const getAdminCategory = async (id) => {
  const response = await api.get(`/admin/categories/${id}`);

  return response.data.data;
};

export const createCategory = async (formData) => {
  const response = await api.post("/admin/categories", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const updateCategory = async (id, formData) => {
  const response = await api.patch(`/admin/categories/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const toggleCategoryStatus = async (id) => {
  const response = await api.patch(`/admin/categories/${id}/status`);

  return response.data.data;
};

export const archiveCategory = async (id) => {
  const response = await api.patch(`/admin/categories/${id}/archive`);

  return response.data.data;
};

export const restoreCategory = async (id) => {
  const response = await api.patch(`/admin/categories/${id}/restore`);

  return response.data.data;
};
