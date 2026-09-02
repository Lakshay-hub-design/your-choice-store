import api from "@/lib/axios";

export const createReturnRequest = async ({ orderId, items, reason, description, images = [] }) => {
  const formData = new FormData();

  formData.append("orderId", orderId);

  formData.append("items", JSON.stringify(items));

  formData.append("reason", reason);

  formData.append("description", description);

  images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await api.post("/returns", formData);

  return response.data.data;
};

export const markReturnAsShipped = async ({ returnId, courierName, trackingNumber }) => {
  const response = await api.patch(`/returns/${returnId}/shipped`, {
    courierName,
    trackingNumber,
  });

  return response.data.data;
};
