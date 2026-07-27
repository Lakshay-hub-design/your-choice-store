import api from "@/lib/axios";

export const getCheckoutSummary = () => {
  return api.get("/checkout");
};

export const placeOrder = (data, idempotencyKey) => {
  return api.post("/orders", data, {
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });
};
