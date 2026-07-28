import api from "@/lib/axios";

export const getAdminProducts = async (params = {}) => {
  const response = await api.get("/admin/products", {
    params,
  });

  return response.data?.data;
};

export const createAdminProduct = async (formData) => {
  const response = await api.post("/admin/products", formData);

  return response.data?.data;
};
