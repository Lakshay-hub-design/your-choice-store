"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { toast } from "sonner";

import CategoryForm from "@/features/admin/categories/components/CategoryForm";

import {
  getAdminCategory,
  getAdminCategories,
  updateCategory,
} from "@/features/admin/categories/services/adminCategoryService";

export default function EditCategoryPage() {
  const router = useRouter();

  const { id } = useParams();

  const [category, setCategory] = useState(null);

  const [categories, setCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      setError("");

      const [categoryData, categoriesData] = await Promise.all([
        getAdminCategory(id),

        getAdminCategories({
          page: 1,
          limit: 1000,
        }),
      ]);

      setCategory(categoryData);

      setCategories(categoriesData.categories || []);
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load category.";

      setError(message);

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      await updateCategory(id, formData);

      toast.success("Category updated successfully.");

      router.push("/admin/categories");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <CategoryFormSkeleton />;
  }

  if (!category) {
    return <CategoryError message={error} onRetry={loadData} />;
  }

  return (
    <CategoryForm
      mode="edit"
      initialValues={category}
      categories={categories}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

function CategoryFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-56 animate-pulse rounded-lg bg-[#F3F4F6]" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="h-[340px] animate-pulse rounded-2xl bg-[#F3F4F6]" />

          <div className="h-[260px] animate-pulse rounded-2xl bg-[#F3F4F6]" />
        </div>

        <div className="space-y-6">
          <div className="h-[250px] animate-pulse rounded-2xl bg-[#F3F4F6]" />

          <div className="h-[220px] animate-pulse rounded-2xl bg-[#F3F4F6]" />

          <div className="h-[170px] animate-pulse rounded-2xl bg-[#F3F4F6]" />
        </div>
      </div>
    </div>
  );
}

function CategoryError({ message, onRetry }) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white">
      <h2 className="text-xl font-semibold text-[#242424]">Unable to load category</h2>

      <p className="mt-2 text-sm text-[#6B7280]">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-xl bg-[#FF5A5F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#F1494E]"
      >
        Try Again
      </button>
    </div>
  );
}
