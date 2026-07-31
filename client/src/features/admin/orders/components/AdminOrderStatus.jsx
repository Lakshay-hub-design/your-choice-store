"use client";

import { useState } from "react";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { toast } from "sonner";

import {
  cancelAdminOrder,
  updateAdminOrderStatus,
} from "@/features/admin/orders/services/adminOrderService";

import AdminCancelOrderModal from "./AdminCancelOrderModal";

const NEXT_STATUS = {
  PLACED: "CONFIRMED",
  CONFIRMED: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

const LABELS = {
  CONFIRMED: "Confirm Order",
  PROCESSING: "Start Processing",
  SHIPPED: "Mark as Shipped",
  DELIVERED: "Mark as Delivered",
};

export default function AdminOrderStatus({ order, onUpdated }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const [isCancelling, setIsCancelling] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);

  const nextStatus = NEXT_STATUS[order.orderStatus];

  const canCancel = ["PLACED", "CONFIRMED", "PROCESSING"].includes(order.orderStatus);

  const handleUpdate = async () => {
    if (!nextStatus) {
      return;
    }

    try {
      setIsUpdating(true);

      const updatedOrder = await updateAdminOrderStatus(order._id, nextStatus);

      onUpdated(updatedOrder);

      toast.success(`Order marked as ${formatStatus(nextStatus)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async (reason) => {
    try {
      setIsCancelling(true);

      const updatedOrder = await cancelAdminOrder(order._id, reason);

      onUpdated(updatedOrder);

      setShowCancelModal(false);

      toast.success("Order cancelled successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to cancel order.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="font-semibold text-[#242424]">Order Status</h2>

        <div className="mt-4">
          <p className="mb-1.5 text-xs text-[#9CA3AF]">Current Status</p>

          <OrderStatusBadge status={order.orderStatus} />
        </div>

        {nextStatus && (
          <div className="mt-5 border-t border-[#F0F0F0] pt-5">
            <p className="text-xs text-[#6B7280]">Next step</p>

            <p className="mt-1 text-sm font-semibold text-[#242424]">{formatStatus(nextStatus)}</p>

            <button
              type="button"
              disabled={isUpdating || isCancelling}
              onClick={handleUpdate}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-4 text-sm font-semibold text-white transition hover:bg-[#f1494e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />

                  {LABELS[nextStatus]}
                </>
              )}
            </button>
          </div>
        )}

        {canCancel && (
          <button
            type="button"
            disabled={isUpdating || isCancelling}
            onClick={() => setShowCancelModal(true)}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle size={16} />
            Cancel Order
          </button>
        )}

        {order.orderStatus === "DELIVERED" && (
          <p className="mt-4 text-xs leading-5 text-[#6B7280]">
            This order has been delivered and no further fulfillment actions are available.
          </p>
        )}

        {order.orderStatus === "CANCELLED" && (
          <p className="mt-4 text-xs leading-5 text-[#6B7280]">
            This order has been cancelled and cannot be updated.
          </p>
        )}
      </div>

      <AdminCancelOrderModal
        open={showCancelModal}
        order={order}
        isCancelling={isCancelling}
        onClose={() => {
          if (!isCancelling) {
            setShowCancelModal(false);
          }
        }}
        onConfirm={handleCancel}
      />
    </>
  );
}

function OrderStatusBadge({ status }) {
  const styles = {
    PLACED: "bg-blue-50 text-blue-600",

    CONFIRMED: "bg-indigo-50 text-indigo-600",

    PROCESSING: "bg-amber-50 text-amber-600",

    SHIPPED: "bg-purple-50 text-purple-600",

    DELIVERED: "bg-green-50 text-green-600",

    CANCELLED: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
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

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}
