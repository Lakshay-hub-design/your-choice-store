import api from "@/lib/axios";

export const getReturnRequests = async ({ page = 1, limit = 10, status = "" } = {}) => {
  const response = await api.get("/admin/returns", {
    params: {
      page,
      limit,
      ...(status && { status }),
    },
  });

  return response.data.data;
};

export const getReturnRequestById = async (returnId) => {
  const response = await api.get(`/admin/returns/${returnId}`);

  return response.data.data;
};
