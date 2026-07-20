import api from "@/lib/axios";

export const getUserAddresses = async () => {
  const response = await api.get("/addresses");

  return response.data;
};

export const getAddressById = async (id) => {
  const response = await api.get(`/addresses/${id}`);

  return response.data;
};

export const createAddress = async (data) => {
  const response = await api.post("/addresses", data);

  return response.data;
};

export const updateAddress = async (id, data) => {
  const response = await api.patch(`/addresses/${id}`, data);

  return response.data;
};

export const deleteAddress = async (id) => {
  const response = await api.delete(`/addresses/${id}`);

  return response.data;
};
