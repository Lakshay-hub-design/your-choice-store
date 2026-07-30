"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { PackageOpen, Plus, RefreshCw, Archive } from "lucide-react";

import { toast } from "sonner";

import { getAdminProducts } from "@/features/admin/products/services/adminProductService";

import AdminProductFilters from "@/features/admin/products/components/AdminProductFilters";
import AdminProductTable from "@/features/admin/products/components/AdminProductTable";
import AdminProductPagination from "@/features/admin/products/components/AdminProductPagination";
import { getCategories } from "@/features/categories/services/categoryService";
import { archiveAdminProduct } from "@/features/admin/products/services/adminProductService";

import ArchiveProductModal from "@/features/admin/products/components/ArchiveProductModal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);

  const [pagination, setPagination] = useState(null);

  const [categories, setCategories] = useState([]);

  const [productToArchive, setProductToArchive] = useState(null);

  const [isArchiving, setIsArchiving] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: "",
    category: "",
    status: "",
    stock: "",
    sort: "newest",
  });

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getAdminProducts(filters);

      setProducts(data?.products || []);

      setPagination(data?.pagination || null);
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load products.";

      setError(message);

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();

        const data = response?.data?.data ?? response?.data ?? response;

        setCategories(data?.categories ?? data ?? []);
      } catch (error) {
        console.error("Unable to load admin product categories:", error);
      }
    };

    loadCategories();
  }, []);

  const updateFilters = useCallback((updates) => {
    setFilters((current) => {
      const isPageChange = Object.prototype.hasOwnProperty.call(updates, "page");

      return {
        ...current,
        ...updates,

        page: isPageChange ? updates.page : 1,
      };
    });
  }, []);

  const handleStatusChange = (productId, isActive) => {
    setProducts((current) =>
      current.map((product) =>
        product._id === productId
          ? {
              ...product,
              isActive,
            }
          : product
      )
    );
  };

  const handleArchiveProduct = async () => {
    if (!productToArchive?._id) {
      return;
    }

    try {
      setIsArchiving(true);

      await archiveAdminProduct(productToArchive._id);

      setProducts((current) => current.filter((product) => product._id !== productToArchive._id));

      toast.success("Product archived successfully");

      setProductToArchive(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to archive product.");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div>
      {/* Header */}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">Products</h1>

          <p className="mt-1 text-sm text-[#6B7280]">Manage your store's products and inventory.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/archived"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#242424] transition hover:bg-[#F8F9FB]"
          >
            <Archive size={16} />
            Archived
          </Link>

          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-5 text-sm font-semibold text-white transition hover:bg-[#f1494e]"
          >
            <Plus size={17} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}

      <AdminProductFilters filters={filters} categories={categories} onChange={updateFilters} />

      {/* Content */}

      <div className="mt-5 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        {isLoading ? (
          <ProductTableLoading />
        ) : error ? (
          <ProductError message={error} onRetry={loadProducts} />
        ) : products.length === 0 ? (
          <ProductEmpty />
        ) : (
          <AdminProductTable
            products={products}
            onStatusChange={handleStatusChange}
            onArchive={setProductToArchive}
          />
        )}
      </div>
      <AdminProductPagination
        pagination={pagination}
        onPageChange={(page) => {
          updateFilters({
            page,
          });

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }}
      />

      <ArchiveProductModal
        product={productToArchive}
        isArchiving={isArchiving}
        onClose={() => {
          if (!isArchiving) {
            setProductToArchive(null);
          }
        }}
        onConfirm={handleArchiveProduct}
      />
    </div>
  );
}

function ProductTableLoading() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-xl bg-[#F3F4F6]" />
      ))}
    </div>
  );
}

function ProductError({ message, onRetry }) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <RefreshCw size={20} className="text-red-500" />
      </div>

      <h2 className="mt-4 font-semibold text-[#242424]">Unable to load products</h2>

      <p className="mt-1 max-w-md text-sm text-[#6B7280]">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#242424] hover:bg-[#F8F9FB]"
      >
        Try Again
      </button>
    </div>
  );
}

function ProductEmpty() {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF5A5F]/10">
        <PackageOpen size={23} className="text-[#FF5A5F]" />
      </div>

      <h2 className="mt-4 font-semibold text-[#242424]">No products found</h2>

      <p className="mt-1 text-sm text-[#6B7280]">Try changing your search or filters.</p>
    </div>
  );
}
