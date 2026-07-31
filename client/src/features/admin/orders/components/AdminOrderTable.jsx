"use client";

import Link from "next/link";

import { ChevronRight } from "lucide-react";

export default function AdminOrderTable({ orders = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1050px]">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA] text-left">
            <TableHeading>Order</TableHeading>

            <TableHeading>Customer</TableHeading>

            <TableHeading>Date</TableHeading>

            <TableHeading>Items</TableHeading>

            <TableHeading>Total</TableHeading>

            <TableHeading>Payment</TableHeading>

            <TableHeading>Status</TableHeading>

            <TableHeading>Action</TableHeading>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <OrderRow key={order._id} order={order} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderRow({ order }) {
  const itemCount = order.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  return (
    <tr className="border-b border-[#F0F0F0] transition last:border-0 hover:bg-[#FAFAFA]">
      {/* Order */}

      <td className="px-5 py-4">
        <Link
          href={`/admin/orders/${order._id}`}
          className="text-sm font-semibold text-[#242424] transition hover:text-[#FF5A5F]"
        >
          {order.orderNumber}
        </Link>
      </td>

      {/* Customer */}

      <td className="px-5 py-4">
        <div className="max-w-[190px]">
          <p className="truncate text-sm font-medium text-[#242424]">
            {order.shippingAddress?.fullName || "—"}
          </p>

          <p className="mt-0.5 truncate text-xs text-[#9CA3AF]">
            {order.shippingAddress?.phone || "—"}
          </p>
        </div>
      </td>

      {/* Date */}

      <td className="px-5 py-4 text-sm text-[#6B7280]">
        {formatOrderDate(order.placedAt || order.createdAt)}
      </td>

      {/* Items */}

      <td className="px-5 py-4 text-sm text-[#6B7280]">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </td>

      {/* Total */}

      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-[#242424]">
          ₹{Number(order.pricing?.grandTotal || 0).toLocaleString("en-IN")}
        </p>
      </td>

      {/* Payment */}

      <td className="px-5 py-4">
        <div className="space-y-1">
          <PaymentBadge status={order.paymentStatus} />

          <p className="text-[11px] text-[#9CA3AF]">{order.paymentMethod}</p>
        </div>
      </td>

      {/* Order Status */}

      <td className="px-5 py-4">
        <OrderStatusBadge status={order.orderStatus} />
      </td>

      {/* Action */}

      <td className="px-5 py-4">
        <Link
          href={`/admin/orders/${order._id}`}
          aria-label={`View ${order.orderNumber}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#242424]"
        >
          <ChevronRight size={18} />
        </Link>
      </td>
    </tr>
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

function PaymentBadge({ status }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-600",

    PAID: "bg-green-50 text-green-600",

    FAILED: "bg-red-50 text-red-600",

    REFUNDED: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
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

function formatOrderDate(date) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function TableHeading({ children }) {
  return (
    <th className="px-5 py-3 text-xs font-semibold tracking-wide text-[#6B7280] uppercase">
      {children}
    </th>
  );
}
