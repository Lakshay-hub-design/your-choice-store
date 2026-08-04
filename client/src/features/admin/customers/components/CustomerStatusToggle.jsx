"use client";

import { useState } from "react";

import { toast } from "sonner";

import { toggleCustomerStatus } from "@/features/admin/customers/services/adminCustomerService";

export default function CustomerStatusToggle({ customerId, isActive, onSuccess }) {
  const [active, setActive] = useState(isActive);

  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const customer = await toggleCustomerStatus(customerId);

      setActive(customer.isActive);

      onSuccess?.(customer._id, customer.isActive);

      toast.success(`Customer ${customer.isActive ? "activated" : "deactivated"} successfully.`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update customer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        active ? "bg-[#22C55E]" : "bg-[#D1D5DB]"
      } ${isLoading ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          active ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
