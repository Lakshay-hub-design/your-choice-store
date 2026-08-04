"use client";

import Link from "next/link";

export default function CustomerOrdersTable({ orders = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] px-6 py-4">
        <h2 className="text-lg font-semibold text-[#242424]">Recent Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="py-12 text-center text-[#6B7280]">No orders found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="bg-[#FAFAFA]">
              <tr>
                <Heading>Order</Heading>
                <Heading>Date</Heading>
                <Heading>Items</Heading>
                <Heading>Total</Heading>
                <Heading>Payment</Heading>
                <Heading>Status</Heading>
                <Heading></Heading>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-t border-[#F3F4F6]">
                  <Cell>{order.orderNumber}</Cell>

                  <Cell>{new Date(order.createdAt).toLocaleDateString()}</Cell>

                  <Cell>{order.items.length}</Cell>

                  <Cell>₹{order.pricing.grandTotal.toLocaleString("en-IN")}</Cell>

                  <Cell>
                    <PaymentBadge status={order.paymentStatus} />
                  </Cell>

                  <Cell>
                    <OrderBadge status={order.orderStatus} />
                  </Cell>

                  <Cell>
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="text-sm font-medium text-[#FF5A5F] hover:underline"
                    >
                      View
                    </Link>
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Heading({ children }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#6B7280] uppercase">
      {children}
    </th>
  );
}

function Cell({ children }) {
  return <td className="px-6 py-4 text-sm text-[#242424]">{children}</td>;
}

function OrderBadge({ status }) {
  const styles = {
    PLACED: "bg-blue-50 text-blue-600",
    CONFIRMED: "bg-indigo-50 text-indigo-600",
    PROCESSING: "bg-yellow-50 text-yellow-700",
    SHIPPED: "bg-purple-50 text-purple-600",
    DELIVERED: "bg-green-50 text-green-600",
    CANCELLED: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function PaymentBadge({ status }) {
  const styles = {
    PAID: "bg-green-50 text-green-600",
    PENDING: "bg-yellow-50 text-yellow-700",
    FAILED: "bg-red-50 text-red-600",
    REFUNDED: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}
