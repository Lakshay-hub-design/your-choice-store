"use client";

import { use, useCallback, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { AlertCircle, ArrowLeft, CreditCard, MapPin, Package, RefreshCw, User } from "lucide-react";

import { getAdminOrderById } from "@/features/admin/orders/services/adminOrderService";

import AdminOrderStatus from "@/features/admin/orders/components/AdminOrderStatus";
import AdminOrderTimeline from "@/features/admin/orders/components/AdminOrderTimeline";

export default function AdminOrderDetailsPage({ params }) {
  const { id } = use(params);

  const [order, setOrder] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const loadOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getAdminOrderById(id);

      setOrder(data);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load order.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  if (isLoading) {
    return <OrderLoading />;
  }

  if (error || !order) {
    return <OrderError message={error} onRetry={loadOrder} />;
  }

  return (
    <div>
      {/* Back */}

      <Link
        href="/admin/orders"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#242424]"
      >
        <ArrowLeft size={16} />
        Orders
      </Link>

      {/* Header */}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-medium text-[#9CA3AF]">Order</p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">
            {order.orderNumber}
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            Placed {formatDateTime(order.placedAt || order.createdAt)}
          </p>
        </div>

        <OrderStatusBadge status={order.orderStatus} />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* LEFT */}

        <div className="space-y-6">
          <OrderItems order={order} />

          <OrderPricing pricing={order.pricing} />

          <AdminOrderTimeline history={order.statusHistory} />
        </div>

        {/* RIGHT */}

        <div className="space-y-5 xl:sticky xl:top-6">
          <AdminOrderStatus order={order} onUpdated={setOrder} />

          <CustomerCard order={order} />

          <ShippingCard address={order.shippingAddress} />

          <PaymentCard order={order} />

          {order.orderStatus === "CANCELLED" && <CancellationCard order={order} />}
        </div>
      </div>
    </div>
  );
}

function OrderItems({ order }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
      <div className="flex items-center gap-2 border-b border-[#F0F0F0] px-5 py-4">
        <Package size={18} className="text-[#FF5A5F]" />

        <h2 className="font-semibold text-[#242424]">Order Items</h2>
      </div>

      <div className="divide-y divide-[#F0F0F0]">
        {order.items?.map((item, index) => (
          <div key={`${item.product}-${index}`} className="flex gap-4 p-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FFF9F5]">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package size={22} className="text-[#D1D5DB]" />
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row">
              <div className="min-w-0">
                <p className="font-semibold text-[#242424]">{item.name}</p>

                <p className="mt-1 text-xs text-[#9CA3AF]">SKU: {item.sku || "—"}</p>

                <p className="mt-2 text-sm text-[#6B7280]">
                  ₹{formatMoney(item.price)} × {item.quantity}
                </p>
              </div>

              <p className="shrink-0 text-sm font-bold text-[#242424]">
                ₹{formatMoney(item.subtotal)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function OrderPricing({ pricing }) {
  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <h2 className="font-semibold text-[#242424]">Order Summary</h2>

      <div className="mt-5 space-y-3">
        <PriceRow label="Items Total" value={pricing?.itemsTotal} />

        <PriceRow label="Shipping" value={pricing?.shippingFee} />

        {pricing?.discount > 0 && <PriceRow label="Discount" value={-pricing.discount} />}

        {pricing?.tax > 0 && <PriceRow label="Tax" value={pricing.tax} />}

        <div className="border-t border-[#E5E7EB] pt-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#242424]">Grand Total</span>

            <span className="text-lg font-bold text-[#242424]">
              ₹{formatMoney(pricing?.grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceRow({ label, value = 0 }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#6B7280]">{label}</span>

      <span className="font-medium text-[#242424]">
        {value < 0 ? "-" : ""}₹{formatMoney(Math.abs(value || 0))}
      </span>
    </div>
  );
}

function CustomerCard({ order }) {
  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex items-center gap-2">
        <User size={17} className="text-[#FF5A5F]" />

        <h2 className="font-semibold text-[#242424]">Customer</h2>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm font-semibold text-[#242424]">
          {order.shippingAddress?.fullName || "—"}
        </p>

        {order.user?.email && (
          <p className="text-sm break-all text-[#6B7280]">{order.user.email}</p>
        )}

        <p className="text-sm text-[#6B7280]">{order.shippingAddress?.phone || "—"}</p>
      </div>
    </section>
  );
}

function ShippingCard({ address }) {
  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex items-center gap-2">
        <MapPin size={17} className="text-[#FF5A5F]" />

        <h2 className="font-semibold text-[#242424]">Shipping Address</h2>
      </div>

      <div className="mt-4 text-sm leading-6 text-[#6B7280]">
        <p className="font-semibold text-[#242424]">{address?.fullName}</p>

        {address?.houseNumber && <p>{address.houseNumber}</p>}

        {address?.formattedAddress && <p>{address.formattedAddress}</p>}

        {address?.landmark && <p>Landmark: {address.landmark}</p>}

        <p>{[address?.city, address?.state, address?.postalCode].filter(Boolean).join(", ")}</p>

        <p>{address?.country}</p>

        <p className="mt-2 font-medium text-[#242424]">{address?.phone}</p>
      </div>
    </section>
  );
}

function PaymentCard({ order }) {
  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex items-center gap-2">
        <CreditCard size={17} className="text-[#FF5A5F]" />

        <h2 className="font-semibold text-[#242424]">Payment</h2>
      </div>

      <div className="mt-4 space-y-3">
        <InfoRow
          label="Method"
          value={order.paymentMethod === "COD" ? "Cash on Delivery" : "Online"}
        />

        <InfoRow label="Status" value={formatStatus(order.paymentStatus)} />

        {order.payment?.provider && <InfoRow label="Provider" value={order.payment.provider} />}

        {order.payment?.paymentId && <InfoRow label="Payment ID" value={order.payment.paymentId} />}
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-[#9CA3AF]">{label}</span>

      <span className="max-w-[190px] text-right font-medium break-all text-[#242424]">
        {value || "—"}
      </span>
    </div>
  );
}

function CancellationCard({ order }) {
  return (
    <section className="rounded-2xl border border-red-100 bg-red-50 p-5">
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle size={17} />

        <h2 className="font-semibold">Cancellation</h2>
      </div>

      <p className="mt-3 text-sm leading-6 text-red-600">
        {order.cancellationReason || "No cancellation reason provided."}
      </p>

      {order.cancelledAt && (
        <p className="mt-3 text-xs text-red-400">Cancelled {formatDateTime(order.cancelledAt)}</p>
      )}
    </section>
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
      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

function OrderLoading() {
  return (
    <div>
      <div className="h-5 w-24 animate-pulse rounded bg-[#E5E7EB]" />

      <div className="mt-6 h-10 w-72 animate-pulse rounded-lg bg-[#E5E7EB]" />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="h-72 animate-pulse rounded-2xl bg-white" />

          <div className="h-56 animate-pulse rounded-2xl bg-white" />
        </div>

        <div className="space-y-5">
          <div className="h-48 animate-pulse rounded-2xl bg-white" />

          <div className="h-44 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    </div>
  );
}

function OrderError({ message, onRetry }) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertCircle size={23} className="text-red-500" />
      </div>

      <h1 className="mt-4 text-lg font-bold text-[#242424]">Unable to load order</h1>

      <p className="mt-2 max-w-md text-sm text-[#6B7280]">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#242424]"
      >
        <RefreshCw size={15} />
        Try Again
      </button>
    </div>
  );
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function formatStatus(status = "") {
  if (!status) return "—";

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function formatDateTime(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
