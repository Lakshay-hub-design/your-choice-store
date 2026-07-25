"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Box,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  MapPin,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

import { getOrderById } from "@/features/orders/services/orderService";

export default function OrderDetailsPage({ params }) {
  const { orderId } = use(params);

  const [order, setOrder] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadOrder = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getOrderById(orderId);

        if (cancelled) return;

        setOrder(response.data?.data);
      } catch (error) {
        if (cancelled) return;

        setError(error.response?.data?.message || "Unable to load order.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (isLoading) {
    return <OrderDetailsSkeleton />;
  }

  if (error || !order) {
    return <OrderError message={error} />;
  }

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#FF5A5F]"
      >
        <ArrowLeft size={16} />
        Back to Orders
      </Link>

      <OrderHeader order={order} />

      <div className="mt-6">
        <OrderTimeline order={order} />
      </div>

      <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-5">
          <OrderProducts items={order.items} />

          <DeliveryAddress address={order.shippingAddress} />
        </div>

        <div className="space-y-5 xl:sticky xl:top-6">
          <PaymentDetails order={order} />

          <OrderPriceSummary pricing={order.pricing} />
        </div>
      </div>
    </div>
  );
}

function OrderHeader({ order }) {
  return (
    <div className="mt-5 flex flex-col justify-between gap-4 rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:flex-row sm:items-center sm:p-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-[#242424] sm:text-2xl">Order Details</h1>

          <OrderStatusBadge status={order.orderStatus} />
        </div>

        <p className="mt-2 text-sm text-[#6B7280]">
          Order <span className="font-semibold text-[#242424]">{order.orderNumber}</span>
        </p>

        <p className="mt-1 text-xs text-[#9CA3AF]">
          Placed on {formatDateTime(order.placedAt || order.createdAt)}
        </p>
      </div>

      <div className="rounded-xl bg-[#FFF9F5] px-4 py-3 sm:text-right">
        <p className="text-[10px] font-medium tracking-wide text-[#9CA3AF] uppercase">
          Order Total
        </p>

        <p className="mt-1 text-xl font-extrabold text-[#242424]">
          ₹{order.pricing.grandTotal.toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}

const ORDER_STEPS = [
  {
    status: "PLACED",
    label: "Order Placed",
    icon: CheckCircle2,
  },
  {
    status: "CONFIRMED",
    label: "Confirmed",
    icon: Check,
  },
  {
    status: "PROCESSING",
    label: "Processing",
    icon: Box,
  },
  {
    status: "SHIPPED",
    label: "Shipped",
    icon: Truck,
  },
  {
    status: "DELIVERED",
    label: "Delivered",
    icon: Package,
  },
];

function OrderTimeline({ order }) {
  const statusHistory = order.statusHistory || [];

  const getHistoryEntry = (status) => {
    return statusHistory.find((entry) => entry.status === status);
  };

  const cancelledEntry = getHistoryEntry("CANCELLED");

  if (order.orderStatus === "CANCELLED" || cancelledEntry) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <XCircle size={20} className="text-red-500" />
          </div>

          <div>
            <h2 className="font-bold text-[#242424]">Order Cancelled</h2>

            <p className="mt-1 text-sm text-[#6B7280]">This order has been cancelled.</p>

            {(cancelledEntry?.timestamp || order.cancelledAt) && (
              <p className="mt-1 text-xs text-[#9CA3AF]">
                {formatDateTime(cancelledEntry?.timestamp || order.cancelledAt)}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Clock3 size={18} className="text-[#FF5A5F]" />

        <h2 className="font-bold text-[#242424]">Order Status</h2>
      </div>

      {/* Desktop */}
      <div className="mt-7 hidden sm:flex">
        {ORDER_STEPS.map((step, index) => {
          const Icon = step.icon;

          const historyEntry = getHistoryEntry(step.status);

          const completed = Boolean(historyEntry);

          const nextStep = ORDER_STEPS[index + 1];

          const nextCompleted = nextStep ? Boolean(getHistoryEntry(nextStep.status)) : false;

          return (
            <div key={step.status} className="flex flex-1 items-start last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                    completed
                      ? "border-[#FF5A5F] bg-[#FF5A5F] text-white"
                      : "border-[#E5E7EB] bg-white text-[#9CA3AF]"
                  }`}
                >
                  <Icon size={16} />
                </div>

                <span
                  className={`mt-2 text-[10px] font-semibold whitespace-nowrap ${
                    completed ? "text-[#242424]" : "text-[#9CA3AF]"
                  }`}
                >
                  {step.label}
                </span>

                {historyEntry && (
                  <span className="mt-1 max-w-[100px] text-center text-[9px] leading-4 text-[#9CA3AF]">
                    {formatTimelineDate(historyEntry.timestamp)}
                  </span>
                )}
              </div>

              {index < ORDER_STEPS.length - 1 && (
                <div
                  className={`mt-4 h-[2px] flex-1 ${
                    completed && nextCompleted ? "bg-[#FF5A5F]" : "bg-[#E5E7EB]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="mt-6 sm:hidden">
        {ORDER_STEPS.map((step, index) => {
          const Icon = step.icon;

          const historyEntry = getHistoryEntry(step.status);

          const completed = Boolean(historyEntry);

          const nextStep = ORDER_STEPS[index + 1];

          const nextCompleted = nextStep ? Boolean(getHistoryEntry(nextStep.status)) : false;

          return (
            <div key={step.status} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    completed
                      ? "bg-[#FF5A5F] text-white"
                      : "border border-[#E5E7EB] bg-white text-[#9CA3AF]"
                  }`}
                >
                  <Icon size={14} />
                </div>

                {index < ORDER_STEPS.length - 1 && (
                  <div
                    className={`min-h-10 w-[2px] flex-1 ${
                      completed && nextCompleted ? "bg-[#FF5A5F]" : "bg-[#E5E7EB]"
                    }`}
                  />
                )}
              </div>

              <div className="min-h-16 pb-4">
                <p
                  className={`pt-1.5 text-sm ${
                    completed ? "font-semibold text-[#242424]" : "text-[#9CA3AF]"
                  }`}
                >
                  {step.label}
                </p>

                {historyEntry && (
                  <p className="mt-1 text-[10px] text-[#9CA3AF]">
                    {formatDateTime(historyEntry.timestamp)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OrderProducts({ items }) {
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Package size={18} className="text-[#FF5A5F]" />

        <h2 className="font-bold text-[#242424]">Items</h2>

        <span className="text-xs text-[#9CA3AF]">({totalQuantity})</span>
      </div>

      <div className="mt-5 divide-y divide-[#EDE9E6]">
        {items.map((item) => (
          <div key={item.product} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#EDE9E6] bg-[#FFF9F5] sm:h-24 sm:w-24">
              <Image
                src={item.image || "/images/product-placeholder.png"}
                alt={item.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-semibold text-[#242424]">{item.name}</h3>

              <p className="mt-1 text-[11px] text-[#9CA3AF]">SKU: {item.sku}</p>

              <p className="mt-2 text-xs text-[#6B7280]">
                ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
              </p>
            </div>

            <div className="shrink-0">
              <p className="text-sm font-bold text-[#242424]">
                ₹{item.subtotal.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DeliveryAddress({ address }) {
  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-[#7C5CFC]" />

        <h2 className="font-bold text-[#242424]">Delivery Address</h2>
      </div>

      <div className="mt-4 rounded-xl bg-[#FFF9F5] p-4">
        <p className="text-sm font-semibold text-[#242424]">{address.fullName}</p>

        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          {address.houseNumber}, {address.formattedAddress}
        </p>

        {address.landmark && (
          <p className="text-sm leading-6 text-[#6B7280]">Landmark: {address.landmark}</p>
        )}

        <p className="text-sm leading-6 text-[#6B7280]">
          {address.city}, {address.state} - {address.postalCode}
        </p>

        <p className="text-sm text-[#6B7280]">{address.country}</p>

        <p className="mt-3 text-sm font-medium text-[#242424]">+91 {address.phone}</p>
      </div>
    </section>
  );
}

function PaymentDetails({ order }) {
  const isPaid = order.paymentStatus === "PAID";

  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5">
      <div className="flex items-center gap-2">
        <Banknote size={18} className="text-green-600" />

        <h2 className="font-bold text-[#242424]">Payment</h2>
      </div>

      <div className="mt-5 space-y-4">
        <InfoRow
          label="Method"
          value={order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}
        />

        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-[#6B7280]">Status</span>

          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              isPaid ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {order.paymentStatus}
          </span>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-[#6B7280]">{label}</span>

      <span className="text-xs font-semibold text-[#242424]">{value}</span>
    </div>
  );
}

function OrderPriceSummary({ pricing }) {
  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5">
      <h2 className="font-bold text-[#242424]">Price Details</h2>

      <div className="mt-5 space-y-3 border-b border-[#EDE9E6] pb-5">
        <PriceRow label="Items Total" value={pricing.itemsTotal} />

        <PriceRow label="Delivery" value={pricing.shippingFee} free />

        {pricing.discount > 0 && <PriceRow label="Discount" value={-pricing.discount} />}

        {pricing.tax > 0 && <PriceRow label="Tax" value={pricing.tax} />}
      </div>

      <div className="flex items-center justify-between pt-5">
        <span className="font-bold text-[#242424]">Total</span>

        <span className="text-xl font-extrabold text-[#242424]">
          ₹{pricing.grandTotal.toLocaleString("en-IN")}
        </span>
      </div>
    </section>
  );
}

function PriceRow({ label, value, free = false }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#6B7280]">{label}</span>

      {free && value === 0 ? (
        <span className="font-semibold text-green-600">FREE</span>
      ) : (
        <span className="font-medium text-[#242424]">
          {value < 0 && "-"}₹{Math.abs(value).toLocaleString("en-IN")}
        </span>
      )}
    </div>
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

function OrderDetailsSkeleton() {
  return (
    <div>
      <div className="h-5 w-28 animate-pulse rounded bg-[#EDE9E6]" />

      <div className="mt-5 h-32 animate-pulse rounded-2xl border border-[#EDE9E6] bg-white" />

      <div className="mt-6 h-40 animate-pulse rounded-2xl border border-[#EDE9E6] bg-white" />

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="h-96 animate-pulse rounded-2xl border border-[#EDE9E6] bg-white" />

        <div className="h-72 animate-pulse rounded-2xl border border-[#EDE9E6] bg-white" />
      </div>
    </div>
  );
}

function OrderError({ message }) {
  return (
    <div className="rounded-2xl border border-[#EDE9E6] bg-white px-5 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertCircle size={25} className="text-red-500" />
      </div>

      <h2 className="mt-4 font-bold text-[#242424]">Unable to load order</h2>

      <p className="mt-2 text-sm text-[#6B7280]">{message}</p>

      <Link
        href="/account/orders"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FF5A5F] px-5 py-2.5 text-xs font-semibold text-white"
      >
        <ArrowLeft size={14} />
        Back to Orders
      </Link>
    </div>
  );
}

function formatDateTime(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatTimelineDate(date) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}
