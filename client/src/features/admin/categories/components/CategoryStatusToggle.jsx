"use client";

import { useState } from "react";

import { toast } from "sonner";

import { toggleCategoryStatus } from "@/features/admin/categories/services/adminCategoryService";

export default function CategoryStatusToggle({ categoryId, isActive, onSuccess }) {
  const [active, setActive] = useState(isActive);

  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const category = await toggleCategoryStatus(categoryId);

      setActive(category.isActive);

      onSuccess?.(category._id, category.isActive);

      toast.success(`Category ${category.isActive ? "activated" : "deactivated"} successfully.`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update category.");
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
