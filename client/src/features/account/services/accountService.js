import api from "@/lib/axios";

export const getAccountSummary = async () => {
  const response = await api.get("/account/summary");
  return response.data;
};
