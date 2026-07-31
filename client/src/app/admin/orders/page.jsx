"use client";

import { useCallback, useEffect, useState } from "react";

import { PackageOpen, RefreshCw, ShoppingBag } from "lucide-react";

import { toast } from "sonner";

import { getAdminOrders } from "@/features/admin/orders/services/adminOrderService";

import AdminOrderFilters from "@/features/admin/orders/components/AdminOrderFilters";
import AdminOrderTable from "@/features/admin/orders/components/AdminOrderTable";
import AdminOrderPagination from "@/features/admin/orders/components/AdminOrderPagination";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);

  const [pagination, setPagination] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,

    search: "",

    status: "",

    paymentStatus: "",

    paymentMethod: "",

    sort: "newest",
  });

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getAdminOrders(filters);

      setOrders(data?.orders || []);

      setPagination(data?.pagination || null);
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load orders.";

      setError(message);

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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

  return (
    <div>
      {/* Header */}

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <ShoppingBag size={24} className="text-[#FF5A5F]" />

          <h1 className="text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">Orders</h1>
        </div>

        <p className="mt-1 text-sm text-[#6B7280]">
          Manage customer orders, payments and fulfillment.
        </p>
      </div>

      {/* Filters */}

      <AdminOrderFilters filters={filters} onChange={updateFilters} />

      {/* Count */}

      {!isLoading && !error && pagination && (
        <div className="mt-5">
          <p className="text-sm text-[#6B7280]">
            <span className="font-semibold text-[#242424]">{pagination.totalOrders || 0}</span>{" "}
            {pagination.totalOrders === 1 ? "order" : "orders"}
          </p>
        </div>
      )}

      {/* Table */}

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        {isLoading ? (
          <OrderTableLoading />
        ) : error ? (
          <OrderError message={error} onRetry={loadOrders} />
        ) : orders.length === 0 ? (
          <OrderEmpty hasFilters={hasActiveFilters(filters)} />
        ) : (
          <AdminOrderTable orders={orders} />
        )}
      </div>

      {/* Pagination */}

      {!error && (
        <AdminOrderPagination
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
      )}
    </div>
  );
}

function OrderTableLoading() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({
        length: 7,
      }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-xl bg-[#F3F4F6]" />
      ))}
    </div>
  );
}

function OrderError({ message, onRetry }) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <RefreshCw size={20} className="text-red-500" />
      </div>

      <h2 className="mt-4 font-semibold text-[#242424]">Unable to load orders</h2>

      <p className="mt-1 max-w-md text-sm text-[#6B7280]">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#242424] transition hover:bg-[#F8F9FB]"
      >
        Try Again
      </button>
    </div>
  );
}

function OrderEmpty({ hasFilters }) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF5A5F]/10">
        <PackageOpen size={23} className="text-[#FF5A5F]" />
      </div>

      <h2 className="mt-4 font-semibold text-[#242424]">
        {hasFilters ? "No matching orders" : "No orders yet"}
      </h2>

      <p className="mt-1 max-w-sm text-sm text-[#6B7280]">
        {hasFilters
          ? "Try changing your search or filters."
          : "Customer orders will appear here once they start placing orders."}
      </p>
    </div>
  );
}

function hasActiveFilters(filters) {
  return Boolean(
    filters.search ||
    filters.status ||
    filters.paymentStatus ||
    filters.paymentMethod ||
    filters.sort !== "newest"
  );
}
