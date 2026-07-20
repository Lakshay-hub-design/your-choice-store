import { create } from "zustand";

import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/features/address/services/addressService";

const useAddressStore = create((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,

  fetchAddresses: async () => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const response = await getUserAddresses();

      set({
        addresses: response.data?.addresses || response.data || [],
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Unable to load addresses.",
      });
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  createNewAddress: async (data) => {
    try {
      const response = await createAddress(data);

      const newAddress = response.data?.address || response.data;

      set({
        addresses: [...get().addresses, newAddress],
      });

      return {
        success: true,
        address: newAddress,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Unable to create address.",
      };
    }
  },

  editAddress: async (id, data) => {
    try {
      const response = await updateAddress(id, data);

      const updatedAddress = response.data?.address || response.data;

      set({
        addresses: get().addresses.map((address) =>
          address._id === id ? updatedAddress : address
        ),
      });

      return {
        success: true,
        address: updatedAddress,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Unable to update address.",
      };
    }
  },

  removeAddress: async (id) => {
    try {
      await deleteAddress(id);

      set({
        addresses: get().addresses.filter((address) => address._id !== id),
      });

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Unable to delete address.",
      };
    }
  },

  clearAddresses: () => {
    set({
      addresses: [],
      error: null,
    });
  },
}));

export default useAddressStore;
