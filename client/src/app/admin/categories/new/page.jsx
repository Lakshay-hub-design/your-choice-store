"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import CategoryForm from "@/features/admin/categories/components/CategoryForm";

import { createCategory } from "@/features/admin/categories/services/adminCategoryService";

import { getAdminCategories } from "@/features/admin/categories/services/adminCategoryService";

export default function CreateCategoryPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);

      const data = await getAdminCategories({
        limit: 1000,
      });

      setCategories(data.categories || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load categories.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      await createCategory(formData);

      toast.success("Category created successfully.");

      router.push("/admin/categories");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-52 animate-pulse rounded-lg bg-[#F3F4F6]" />

        <div className="h-[600px] animate-pulse rounded-2xl bg-[#F3F4F6]" />
      </div>
    );
  }

  return (
    <CategoryForm
      mode="create"
      categories={categories}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
