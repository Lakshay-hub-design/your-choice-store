import api from "@/lib/axios";

export const getOrderById = (orderId) => {
  return api.get(`/orders/${orderId}`);
};

export const getMyOrders = ({ page = 1, limit = 10, status } = {}) => {
  return api.get("/orders", {
    params: {
      page,
      limit,
      ...(status && {
        status,
      }),
    },
  });
};
