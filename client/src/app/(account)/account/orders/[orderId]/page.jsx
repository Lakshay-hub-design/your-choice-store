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
  Clock3,
  MapPin,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

import { getOrderById, cancelOrder } from "@/features/orders/services/orderService";
import OrderReviewActions from "@/features/reviews/components/OrderReviewActions";
import ReturnSection from "@/features/returns/components/ReturnSection";

import { toast } from "sonner";

import CancelOrderModal from "@/features/orders/components/CancelOrderModal";
import ReturnRequestForm from "@/features/returns/components/ReturnRequestForm";

export default function OrderDetailsPage({ params }) {
  const { orderId } = use(params);

  const [order, setOrder] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const [isCancelling, setIsCancelling] = useState(false);

  const [cancelError, setCancelError] = useState("");

  let cancelled = false;

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getOrderById(orderId);

      if (cancelled) return;

      setOrder(response);
    } catch (error) {
      if (cancelled) return;

      setError(error.response?.data?.message || "Unable to load order.");
    } finally {
      if (!cancelled) {
        setIsLoading(false);
      }
    }
  };
  useEffect(() => {
    loadOrder();
  }, [orderId]);

  if (isLoading) {
    return <OrderDetailsSkeleton />;
  }

  if (error || !order) {
    return <OrderError message={error} />;
  }

  const handleCancelOrder = async (reason) => {
    if (isCancelling) return;

    try {
      setIsCancelling(true);
      setCancelError("");

      const updatedOrder = await cancelOrder(orderId, reason);

      if (updatedOrder) {
        setOrder(updatedOrder);
      }

      toast.success("Order cancelled successfully");

      setCancelModalOpen(false);
    } catch (error) {
      setCancelError(error.response?.data?.message || "Unable to cancel order. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#FF5A5F]"
      >
        <ArrowLeft size={16} />
        Back to Orders
      </Link>

      <OrderHeader
        order={order}
        onCancel={() => {
          setCancelError("");
          setCancelModalOpen(true);
        }}
      />

      <div className="mt-6">
        <OrderTimeline order={order} />
      </div>

      <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-5">
          <OrderProducts items={order.items} onReviewUpdated={loadOrder} />

          <ReturnSection order={order} onUpdated={loadOrder} />

          <DeliveryAddress address={order.shippingAddress} />
        </div>

        <div className="space-y-5 xl:sticky xl:top-6">
          <PaymentDetails order={order} />

          <OrderPriceSummary pricing={order.pricing} />
        </div>
      </div>
      <CancelOrderModal
        open={cancelModalOpen}
        onClose={() => {
          if (isCancelling) return;

          setCancelModalOpen(false);
          setCancelError("");
        }}
        onConfirm={handleCancelOrder}
        isCancelling={isCancelling}
        error={cancelError}
      />
    </div>
  );
}

function OrderHeader({ order, onCancel }) {
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

      <div className="flex flex-col gap-3 sm:items-end">
        <div className="w-full rounded-xl bg-[#FFF9F5] px-4 py-3 sm:w-auto sm:text-right">
          <p className="text-[10px] font-medium tracking-wide text-[#9CA3AF] uppercase">
            Order Total
          </p>

          <p className="mt-1 text-xl font-extrabold text-[#242424]">
            ₹{order.pricing.grandTotal.toLocaleString("en-IN")}
          </p>
        </div>

        <CancelOrderButton status={order.orderStatus} onCancel={onCancel} />
      </div>
    </div>
  );
}

function CancelOrderButton({ status, onCancel }) {
  const cancellableStatuses = ["PLACED", "CONFIRMED"];

  if (!cancellableStatuses.includes(status)) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onCancel}
      className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-red-500 transition hover:text-red-600"
    >
      <XCircle size={14} />
      Cancel Order
    </button>
  );
}

function OrderTimeline({ order }) {
  const history = [...(order.statusHistory || [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  if (order.orderStatus === "CANCELLED") {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <XCircle size={20} className="text-red-500" />
          </div>

          <div>
            <h2 className="font-bold text-[#242424]">Order Cancelled</h2>

            <p className="mt-1 text-sm text-[#6B7280]">This order has been cancelled.</p>

            {order.cancellationReason && (
              <div className="mt-3 rounded-lg bg-red-50 px-3 py-2">
                <p className="text-[10px] font-semibold text-red-500">Cancellation reason</p>

                <p className="mt-1 text-xs leading-5 text-red-700">{order.cancellationReason}</p>
              </div>
            )}

            {order.cancelledAt && (
              <p className="mt-2 text-xs text-[#9CA3AF]">{formatDateTime(order.cancelledAt)}</p>
            )}
          </div>
        </div>

        {/* Show actual history below cancellation */}
        {history.length > 0 && <TimelineHistory history={history} />}
      </section>
    );
  }

  if (!history.length) {
    return (
      <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Clock3 size={18} className="text-[#FF5A5F]" />

          <h2 className="font-bold text-[#242424]">Order Timeline</h2>
        </div>

        <div className="mt-5 rounded-xl bg-[#FFF9F5] p-4 text-center">
          <p className="text-sm text-[#6B7280]">Order timeline is not available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Clock3 size={18} className="text-[#FF5A5F]" />

        <h2 className="font-bold text-[#242424]">Order Timeline</h2>
      </div>

      <TimelineHistory history={history} />
    </section>
  );
}

function TimelineHistory({ history }) {
  return (
    <>
      {/* Desktop */}
      <div className="mt-8 hidden sm:block">
        <div className="relative px-2">
          {/* Connecting line */}
          <div className="absolute top-4 right-8 left-8 h-[2px] bg-[#E5E9E6]" />

          {/* Progress line */}
          <div
            className="absolute top-4 left-8 h-[2px] bg-[#FF5A5F] transition-all"
            style={{
              width:
                history.length > 1
                  ? `calc(${((history.length - 1) / (history.length - 1)) * 100}% - 64px)`
                  : "0px",
            }}
          />

          <div className="relative flex justify-between gap-4">
            {history.map((item, index) => {
              const isLast = index === history.length - 1;

              const Icon = getTimelineIcon(item.status);

              return (
                <div
                  key={`${item.status}-${item.timestamp}-${index}`}
                  className="flex min-w-0 flex-1 flex-col items-center text-center"
                >
                  {/* Icon */}
                  <div
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isLast ? "bg-[#FF5A5F] text-white" : "bg-[#FF5A5F] text-white"
                    }`}
                  >
                    <Icon size={14} />
                  </div>

                  {/* Label */}
                  <p className="mt-3 text-xs font-semibold text-[#242424]">
                    {getTimelineLabel(item.status)}
                  </p>

                  {/* Date */}
                  <p className="mt-1 text-[10px] whitespace-nowrap text-[#9CA3AF]">
                    {formatTimelineDate(item.timestamp)}
                  </p>

                  {/* Current */}
                  {isLast && (
                    <span className="mt-2 rounded-full bg-[#FFF0F0] px-2 py-0.5 text-[9px] font-bold text-[#FF5A5F]">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="mt-7 sm:hidden">
        {history.map((item, index) => {
          const isLast = index === history.length - 1;

          const Icon = getTimelineIcon(item.status);

          return (
            <div key={`${item.status}-${item.timestamp}-${index}`} className="relative flex gap-4">
              {!isLast && (
                <div className="absolute top-8 bottom-0 left-[15px] w-[2px] bg-[#FF5A5F]/30" />
              )}

              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF5A5F] text-white">
                <Icon size={14} />
              </div>

              <div className={`min-w-0 flex-1 ${!isLast ? "pb-6" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#242424]">
                    {getTimelineLabel(item.status)}
                  </p>

                  {isLast && (
                    <span className="shrink-0 rounded-full bg-[#FFF0F0] px-2.5 py-1 text-[9px] font-bold text-[#FF5A5F]">
                      Current
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-[#9CA3AF]">{formatDateTime(item.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function getTimelineIcon(status) {
  switch (status) {
    case "PLACED":
      return CheckCircle2;

    case "CONFIRMED":
      return Check;

    case "PROCESSING":
      return Box;

    case "SHIPPED":
      return Truck;

    case "OUT_FOR_DELIVERY":
      return Truck;

    case "DELIVERED":
      return Package;

    case "RTO":
      return Truck;

    case "CANCELLED":
      return XCircle;

    default:
      return Clock3;
  }
}

function getTimelineLabel(status) {
  const labels = {
    PLACED: "Order Placed",
    CONFIRMED: "Order Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    RTO: "Return to Seller",
    CANCELLED: "Order Cancelled",
  };

  return labels[status] || formatStatus(status);
}

function OrderProducts({ items, onReviewUpdated }) {
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

              {item.review && (
                <OrderReviewActions
                  productId={item.product}
                  orderId={item.orderId}
                  review={item.review}
                  onReviewUpdated={onReviewUpdated}
                />
              )}
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
