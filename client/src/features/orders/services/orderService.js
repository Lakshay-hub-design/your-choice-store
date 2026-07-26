import api from "@/lib/axios";

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);

  return response.data.data;
};

export const getMyOrders = async ({ page = 1, limit = 10, status } = {}) => {
  const response = await api.get("/orders", {
    params: {
      page,
      limit,

      ...(status && {
        status,
      }),
    },
  });

  return response.data.data;
};

export const cancelOrder = async (orderId, reason = "") => {
  const response = await api.patch(`/orders/${orderId}/cancel`, {
    reason,
  });

  return response.data.data;
};
