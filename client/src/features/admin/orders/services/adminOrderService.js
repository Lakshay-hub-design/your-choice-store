import api from "@/lib/axios";

export const getAdminOrders = async (filters = {}) => {
  const response = await api.get("/admin/orders", {
    params: filters,
  });

  return response.data?.data;
};

export const getAdminOrderById = async (orderId) => {
  const response = await api.get(`/admin/orders/${orderId}`);

  return response.data?.data;
};

export const updateAdminOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/admin/orders/${orderId}/status`, {
    status,
  });

  return response.data?.data;
};

export const cancelAdminOrder = async (orderId, reason) => {
  const response = await api.patch(`/admin/orders/${orderId}/cancel`, {
    reason,
  });

  return response.data?.data;
};
