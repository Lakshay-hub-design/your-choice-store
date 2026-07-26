"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ChevronLeft, ChevronRight, Package, ShoppingBag } from "lucide-react";

import { getMyOrders } from "@/features/orders/services/orderService";

const STATUS_FILTERS = [
  {
    label: "All",
    value: "",
  },
  {
    label: "Placed",
    value: "PLACED",
  },
  {
    label: "Processing",
    value: "PROCESSING",
  },
  {
    label: "Shipped",
    value: "SHIPPED",
  },
  {
    label: "Delivered",
    value: "DELIVERED",
  },
  {
    label: "Cancelled",
    value: "CANCELLED",
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  const [pagination, setPagination] = useState(null);

  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getMyOrders({
          page,
          limit: 10,
          status,
        });

        if (cancelled) return;

        setOrders(data?.orders || []);

        setPagination(data?.pagination || null);
      } catch (error) {
        if (cancelled) return;

        setError(error.response?.data?.message || "Unable to load your orders.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [page, status]);

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#242424]">My Orders</h1>

        <p className="mt-1 text-sm text-[#6B7280]">View and track all your orders.</p>
      </div>

      {/* Filters */}
      <div className="mt-6 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {STATUS_FILTERS.map((filter) => {
            const active = status === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => handleStatusChange(filter.value)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? "bg-[#FF5A5F] text-white"
                    : "border border-[#EDE9E6] bg-white text-[#6B7280] hover:border-[#FF5A5F]/40 hover:text-[#FF5A5F]"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {isLoading ? (
          <OrdersSkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && pagination && pagination.totalPages > 1 && (
        <div className="mt-7 flex items-center justify-between border-t border-[#EDE9E6] pt-5">
          <p className="text-xs text-[#6B7280]">
            Page {pagination.page} of {pagination.totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((current) => current - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#EDE9E6] bg-white text-[#242424] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((current) => current + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#EDE9E6] bg-white text-[#242424] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }) {
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);

  const firstItem = order.items[0];

  return (
    <article className="overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDE9E6] bg-[#FFF9F5]/60 px-4 py-3 sm:px-5">
        <div>
          <p className="text-[10px] font-medium tracking-wide text-[#9CA3AF] uppercase">Order</p>

          <p className="mt-0.5 text-xs font-bold text-[#242424]">{order.orderNumber}</p>
        </div>

        <OrderStatusBadge status={order.orderStatus} />
      </div>

      <div className="p-4 sm:p-5">
        {/* Product preview */}
        <div className="flex gap-4">
          {firstItem?.image ? (
            <img
              src={firstItem.image}
              alt={firstItem.name}
              className="h-20 w-20 shrink-0 rounded-xl border border-[#EDE9E6] object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#FFF9F5]">
              <Package size={23} className="text-[#FF5A5F]" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 text-sm font-semibold text-[#242424]">{firstItem?.name}</h3>

            <p className="mt-1 text-xs text-[#6B7280]">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>

            {order.items.length > 1 && (
              <p className="mt-1 text-xs text-[#9CA3AF]">
                +{order.items.length - 1} more product
                {order.items.length - 1 > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-[#EDE9E6] pt-4">
          <div>
            <p className="text-[10px] text-[#9CA3AF]">Order Total</p>

            <p className="mt-1 text-lg font-bold text-[#242424]">
              ₹{order.pricing.grandTotal.toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-[10px] text-[#6B7280]">{formatDate(order.createdAt)}</p>
          </div>

          <Link
            href={`/account/orders/${order._id}`}
            className="rounded-xl border border-[#FF5A5F] px-4 py-2.5 text-xs font-semibold text-[#FF5A5F] transition hover:bg-[#FF5A5F] hover:text-white"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

function OrderStatusBadge({ status }) {
  const styles = {
    PLACED: "bg-blue-50 text-blue-700",

    CONFIRMED: "bg-indigo-50 text-indigo-700",

    PROCESSING: "bg-yellow-50 text-yellow-700",

    SHIPPED: "bg-purple-50 text-purple-700",

    DELIVERED: "bg-green-50 text-green-700",

    CANCELLED: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
        styles[status] || "bg-gray-50 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function EmptyOrders() {
  return (
    <div className="rounded-2xl border border-[#EDE9E6] bg-white px-5 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FF5A5F]/10">
        <ShoppingBag size={25} className="text-[#FF5A5F]" />
      </div>

      <h2 className="mt-4 font-bold text-[#242424]">No orders yet</h2>

      <p className="mx-auto mt-2 max-w-sm text-sm text-[#6B7280]">
        When you place an order, you'll be able to track it here.
      </p>

      <Link
        href="/products"
        className="mt-5 inline-flex rounded-xl bg-[#FF5A5F] px-5 py-2.5 text-xs font-semibold text-white"
      >
        Start Shopping
      </Link>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
      {message}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-52 animate-pulse rounded-2xl border border-[#EDE9E6] bg-white"
        />
      ))}
    </div>
  );
}
