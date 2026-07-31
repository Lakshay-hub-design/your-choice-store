import api from "@/lib/axios";

export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");

  return response.data?.data;
};
