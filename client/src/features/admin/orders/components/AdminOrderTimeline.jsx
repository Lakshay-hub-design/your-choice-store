"use client";

import { Check, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminOrderTimeline({ order, onUpdated }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!order) {
    return null;
  }

  const history = order.statusHistory || [];

  const handleRefreshTracking = async () => {
    try {
      setIsRefreshing(true);

      /*
       * The parent owns the actual order refresh.
       *
       * This guarantees we fetch the complete
       * order instead of replacing it with a
       * partial tracking response.
       */
      await onUpdated?.();

      toast.success("Order tracking refreshed.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to refresh order tracking.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-[#242424]">Order Timeline</h2>

        {order.shipment?.awbCode && (
          <button
            type="button"
            onClick={handleRefreshTracking}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-[#242424] transition hover:bg-[#FFF9F5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />

            {isRefreshing ? "Refreshing..." : "Refresh Tracking"}
          </button>
        )}
      </div>

      {/* Current Status */}
      <div className="mt-5 rounded-xl bg-[#FFF9F5] p-4">
        <p className="text-xs text-[#9CA3AF]">Current Order Status</p>

        <div className="mt-2">
          <OrderStatusBadge status={order.orderStatus} />
        </div>
      </div>

      {/* Status History */}
      {history.length > 0 ? (
        <div className="mt-6">
          {history.map((item, index) => {
            const isLast = index === history.length - 1;

            return (
              <div
                key={`${item.status}-${item.timestamp}-${index}`}
                className="relative flex gap-4"
              >
                {!isLast && (
                  <div className="absolute top-8 bottom-0 left-[15px] w-px bg-[#E5E7EB]" />
                )}

                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF5A5F]/10">
                  <Check size={14} className="text-[#FF5A5F]" />
                </div>

                <div className={`min-w-0 ${!isLast ? "pb-6" : ""}`}>
                  <p className="text-sm font-semibold text-[#242424]">
                    {formatStatus(item.status)}
                  </p>

                  <p className="mt-1 text-xs text-[#9CA3AF]">{formatDateTime(item.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-xl bg-[#FFF9F5] p-4 text-center">
          <p className="text-sm text-[#6B7280]">No order status history available.</p>
        </div>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }) {
  const styles = {
    PLACED: "bg-blue-50 text-blue-600",
    CONFIRMED: "bg-indigo-50 text-indigo-600",
    PROCESSING: "bg-amber-50 text-amber-600",
    SHIPPED: "bg-purple-50 text-purple-600",
    OUT_FOR_DELIVERY: "bg-orange-50 text-orange-600",
    DELIVERED: "bg-green-50 text-green-600",
    RTO: "bg-red-50 text-red-600",
    CANCELLED: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

function formatStatus(status = "") {
  if (!status) {
    return "—";
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(date) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}
