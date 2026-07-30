"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { Archive, ArrowLeft, Loader2, RotateCcw } from "lucide-react";

import { toast } from "sonner";

import {
  getAdminProducts,
  restoreAdminProduct,
} from "@/features/admin/products/services/adminProductService";

export default function ArchivedProductsPage() {
  const [products, setProducts] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [restoringId, setRestoringId] = useState(null);

  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getAdminProducts({
        archived: "true",
        limit: 50,
      });

      setProducts(data?.products || []);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load archived products.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleRestore = async (product) => {
    try {
      setRestoringId(product._id);

      await restoreAdminProduct(product._id);

      setProducts((current) => current.filter((item) => item._id !== product._id));

      toast.success("Product restored successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to restore product.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div>
      {/* Back */}

      <Link
        href="/admin/products"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#242424]"
      >
        <ArrowLeft size={16} />
        Products
      </Link>

      {/* Header */}

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Archive size={23} className="text-[#FF5A5F]" />

          <h1 className="text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">
            Archived Products
          </h1>
        </div>

        <p className="mt-2 text-sm text-[#6B7280]">
          Products removed from your storefront are kept here and can be restored.
        </p>
      </div>

      {/* Content */}

      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        {isLoading ? (
          <ArchivedLoading />
        ) : error ? (
          <ArchivedError message={error} onRetry={loadProducts} />
        ) : products.length === 0 ? (
          <ArchivedEmpty />
        ) : (
          <div className="divide-y divide-[#F0F0F0]">
            {products.map((product) => (
              <div
                key={product._id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#242424]">{product.name}</p>

                  <p className="mt-1 text-xs text-[#9CA3AF]">SKU: {product.sku || "—"}</p>
                </div>

                <button
                  type="button"
                  disabled={restoringId === product._id}
                  onClick={() => handleRestore(product)}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-4 text-sm font-semibold text-[#242424] transition hover:border-[#FF5A5F] hover:text-[#FF5A5F] disabled:opacity-50"
                >
                  {restoringId === product._id ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <RotateCcw size={15} />
                      Restore
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArchivedLoading() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-xl bg-[#F3F4F6]" />
      ))}
    </div>
  );
}

function ArchivedEmpty() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F4F6]">
        <Archive size={23} className="text-[#9CA3AF]" />
      </div>

      <h2 className="mt-4 font-semibold text-[#242424]">No archived products</h2>

      <p className="mt-1 text-sm text-[#6B7280]">Archived products will appear here.</p>
    </div>
  );
}

function ArchivedError({ message, onRetry }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center p-6 text-center">
      <p className="text-sm text-red-500">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold"
      >
        Try Again
      </button>
    </div>
  );
}
