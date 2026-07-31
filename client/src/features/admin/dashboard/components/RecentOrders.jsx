import Link from "next/link";

import { ArrowRight, ChevronRight, ShoppingBag } from "lucide-react";

export default function RecentOrders({ orders = [] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
      {/* Header */}

      <div className="flex items-center justify-between gap-4 border-b border-[#F0F0F0] px-5 py-4">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-[#FF5A5F]" />

          <h2 className="font-semibold text-[#242424]">Recent Orders</h2>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF5A5F] transition hover:opacity-80"
        >
          View All
          <ArrowRight size={13} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-[250px] items-center justify-center p-6 text-center">
          <div>
            <ShoppingBag size={26} className="mx-auto text-[#D1D5DB]" />

            <p className="mt-3 text-sm font-medium text-[#6B7280]">No orders yet</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[#F0F0F0] bg-[#FAFAFA] text-left">
                <TableHeading>Order</TableHeading>

                <TableHeading>Customer</TableHeading>

                <TableHeading>Total</TableHeading>

                <TableHeading>Status</TableHeading>

                <TableHeading>Date</TableHeading>

                <TableHeading />
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA]"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="text-sm font-semibold text-[#242424] transition hover:text-[#FF5A5F]"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>

                  <td className="px-5 py-4">
                    <p className="max-w-[160px] truncate text-sm text-[#6B7280]">
                      {order.shippingAddress?.fullName || "—"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-[#242424]">
                    ₹{formatMoney(order.pricing?.grandTotal)}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={order.orderStatus} />
                  </td>

                  <td className="px-5 py-4 text-xs text-[#6B7280]">
                    {formatDate(order.placedAt || order.createdAt)}
                  </td>

                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      aria-label={`View ${order.orderNumber}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-[#F3F4F6] hover:text-[#242424]"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StatusBadge({ status }) {
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
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

function TableHeading({ children }) {
  return (
    <th className="px-5 py-3 text-[11px] font-semibold tracking-wide text-[#6B7280] uppercase">
      {children}
    </th>
  );
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function formatStatus(status = "") {
  if (!status) return "—";

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}
