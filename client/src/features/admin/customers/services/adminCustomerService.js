import api from "@/lib/axios";

export const getAdminCustomers = async (params = {}) => {
  const response = await api.get("/admin/customers", {
    params,
  });

  return response.data.data;
};

export const getAdminCustomer = async (id) => {
  const response = await api.get(`/admin/customers/${id}`);

  return response.data.data;
};

export const toggleCustomerStatus = async (id) => {
  const response = await api.patch(`/admin/customers/${id}/status`);

  return response.data.data;
};

export const archiveCustomer = async (id) => {
  const response = await api.patch(`/admin/customers/${id}/archive`);

  return response.data.data;
};

export const restoreCustomer = async (id) => {
  const response = await api.patch(`/admin/customers/${id}/restore`);

  return response.data.data;
};
