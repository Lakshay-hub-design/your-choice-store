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

export const approveReturnRequest = async (returnId, adminNote = "") => {
  const response = await api.patch(`/admin/returns/${returnId}/approve`, {
    adminNote,
  });

  return response.data.data;
};

export const rejectReturnRequest = async (returnId, adminNote) => {
  const response = await api.patch(`/admin/returns/${returnId}/reject`, {
    adminNote,
  });

  return response.data.data;
};

export const markReturnAsReceived = async (returnId) => {
  const response = await api.patch(`/admin/returns/${returnId}/received`);

  return response.data.data;
};

export const inspectReturn = async ({ returnId, inspectionResult, inspectionNote }) => {
  const response = await api.patch(`/admin/returns/${returnId}/inspect`, {
    inspectionResult,
    inspectionNote,
  });

  return response.data;
};

export const processRefund = async (returnId) => {
  const response = await api.patch(`/admin/returns/${returnId}/refund`);

  return response.data.data;
};
