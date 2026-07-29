"use client";

import { useState } from "react";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateAdminProductStatus } from "@/features/admin/products/services/adminProductService";

export default function ProductStatusToggle({ productId, isActive, onStatusChange }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async () => {
    if (isUpdating) {
      return;
    }

    const nextStatus = !isActive;

    try {
      setIsUpdating(true);

      const updatedProduct = await updateAdminProductStatus(productId, nextStatus);

      onStatusChange?.(productId, updatedProduct.isActive);

      toast.success(updatedProduct.isActive ? "Product activated" : "Product deactivated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update product status.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      disabled={isUpdating}
      onClick={handleChange}
      className="flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        className={`relative h-5 w-9 rounded-full transition ${
          isActive ? "bg-green-500" : "bg-[#D1D5DB]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            isActive ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>

      <span className={`text-xs font-medium ${isActive ? "text-green-600" : "text-[#9CA3AF]"}`}>
        {isUpdating ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isActive ? (
          "Active"
        ) : (
          "Inactive"
        )}
      </span>
    </button>
  );
}
