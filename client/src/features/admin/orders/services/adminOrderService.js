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

export const getAvailableCouriers = async (orderId) => {
  const response = await api.get(`/admin/orders/${orderId}/shipping/couriers`);

  return response.data.data;
};

export const assignCourier = async (orderId, courierId) => {
  const response = await api.post(`/admin/orders/${orderId}/shipping/assign-courier`, {
    courierId,
  });

  return response.data.data;
};

export const schedulePickup = async (orderId, pickupDate) => {
  const response = await api.patch(`/admin/orders/${orderId}/pickup`, {
    pickupDate: pickupDate || null,
  });

  return response.data.data;
};

export const trackShipment = async (orderId) => {
  const response = await api.get(`/admin/orders/${orderId}/tracking`);

  return response.data.data;
};
