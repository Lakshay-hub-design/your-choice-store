"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { Package, Plus } from "lucide-react";

import { toast } from "sonner";

import { getAdminCategories } from "@/features/admin/categories/services/adminCategoryService";

import CategoryTable from "@/features/admin/categories/components/CategoryTable";
import CategoryFilters from "@/features/admin/categories/components/CategoryFilters";
import CategoryPagination from "@/features/admin/categories/components/CategoryPagination";
import CategorySkeleton from "@/features/admin/categories/components/CategorySkeleton";
import CategoryEmpty from "@/features/admin/categories/components/CategoryEmpty";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);

  const [pagination, setPagination] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,

    search: "",

    status: "",

    archived: "false",

    sort: "newest",
  });

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);

      setError("");

      const data = await getAdminCategories(filters);

      setCategories(data.categories || []);

      setPagination(data.pagination);
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load categories.";

      setError(message);

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleStatusChange = (categoryId, isActive) => {
    setCategories((current) =>
      current.map((category) =>
        category._id === categoryId
          ? {
              ...category,
              isActive,
            }
          : category
      )
    );
  };

  const handleArchive = (updatedCategory) => {
    setCategories((current) => current.filter((category) => category._id !== updatedCategory._id));

    setPagination((current) =>
      current
        ? {
            ...current,
            totalCategories: current.totalCategories - 1,
          }
        : current
    );
  };

  const handleRestore = (updatedCategory) => {
    loadCategories();
  };

  return (
    <div>
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>

          <p className="mt-1 text-sm text-[#6B7280]">Organize your store categories.</p>
        </div>

        <Link
          href="/admin/categories/new"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FF5A5F] px-5 text-sm font-semibold text-white"
        >
          <Plus size={17} />
          Add Category
        </Link>
      </div>

      <CategoryFilters filters={filters} onChange={setFilters} />

      <div className="mt-5 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        {isLoading ? (
          <CategorySkeleton />
        ) : error ? (
          <CategoryError message={error} onRetry={loadCategories} />
        ) : categories.length === 0 ? (
          <CategoryEmpty />
        ) : (
          <CategoryTable
            categories={categories}
            onStatusChange={handleStatusChange}
            onArchive={handleArchive}
            onRestore={handleRestore}
          />
        )}
      </div>

      <CategoryPagination
        pagination={pagination}
        onPageChange={(page) =>
          setFilters((current) => ({
            ...current,
            page,
          }))
        }
      />
    </div>
  );
}

function CategoryError({ message, onRetry }) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">
      <h2 className="text-lg font-semibold text-[#242424]">Unable to load categories</h2>

      <p className="mt-2 text-sm text-[#6B7280]">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold hover:bg-[#F8F9FB]"
      >
        Try Again
      </button>
    </div>
  );
}
