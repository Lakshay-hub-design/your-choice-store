import api from "@/lib/axios";

export const getCheckoutSummary = () => {
  return api.get("/checkout");
};

export const placeOrder = (data) => {
  return api.post("/orders", data);
};
