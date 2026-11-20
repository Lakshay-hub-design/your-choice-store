import api from "@/lib/axios";

export const getCheckoutSummary = ({ addressId, paymentMethod, productId } = {}) => {
  const params = {};

  if (addressId) params.addressId = addressId;
  if (paymentMethod) params.paymentMethod = paymentMethod;
  if (productId) params.productId = productId;

  return api.get("/checkout", { params });
};

export const placeOrder = (data, idempotencyKey) => {
  return api.post("/orders", data, {
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });
};

export const verifyOnlinePayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  const response = await api.post("/orders/payments/verify", {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  return response.data;
};
