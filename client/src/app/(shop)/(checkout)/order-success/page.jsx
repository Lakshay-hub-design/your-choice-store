"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Home,
  Loader2,
  MapPin,
  Package,
  ReceiptText,
} from "lucide-react";

import { getOrderById } from "@/features/orders/services/orderService";

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <OrderSuccessContent />
    </Suspense>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("order");

  const [order, setOrder] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing.");
      setIsLoading(false);

      return;
    }

    const loadOrder = async () => {
      try {
        setError("");

        const response = await getOrderById(orderId);

        setOrder(response);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load order details.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !order) {
    return <ErrorState message={error} />;
  }

  return (
    <main className="min-h-screen bg-[#FFF9F5]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Success Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 size={34} className="text-green-600" />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-[#242424] sm:text-3xl">
            Order Placed Successfully!
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#6B7280]">
            Thank you for shopping with YC Gifts & Toys. Your order has been received and is being
            processed.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#EDE9E6] bg-white px-4 py-2">
            <ReceiptText size={15} className="text-[#7C5CFC]" />

            <span className="text-xs text-[#6B7280]">Order ID:</span>

            <span className="text-xs font-bold text-[#242424]">{order.orderNumber}</span>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <OrderItems items={order.items} />

            <DeliveryAddress address={order.shippingAddress} />
          </div>

          <div className="space-y-5 lg:sticky lg:top-6">
            <OrderSummary order={order} />

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#EDE9E6] bg-white px-4 py-3 text-xs font-semibold text-[#242424] transition hover:border-[#FF5A5F]/40"
              >
                <Home size={15} />
                Home
              </Link>

              <Link
                href="/account/orders"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#f1494e]"
              >
                <Package size={15} />
                My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function OrderItems({ items }) {
  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Package size={19} className="text-[#FF5A5F]" />

        <h2 className="font-bold text-[#242424]">Order Items</h2>

        <span className="text-xs text-[#9CA3AF]">({items.length})</span>
      </div>

      <div className="mt-5 divide-y divide-[#EDE9E6]">
        {items.map((item) => (
          <div key={item.product} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#FFF9F5]">
              <Image
                src={item.image || "/images/product-placeholder.png"}
                alt={item.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm leading-5 font-semibold text-[#242424]">
                {item.name}
              </h3>

              <p className="mt-1 text-xs text-[#9CA3AF]">SKU: {item.sku}</p>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">
                  ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                </span>

                <span className="text-sm font-bold text-[#242424]">
                  ₹{item.subtotal.toLocaleString("en-IN")}
                </span>
              </div>
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
        <MapPin size={19} className="text-[#7C5CFC]" />

        <h2 className="font-bold text-[#242424]">Delivery Address</h2>
      </div>

      <div className="mt-4 rounded-xl bg-[#FFF9F5] p-4">
        <p className="text-sm font-semibold text-[#242424]">{address.fullName}</p>

        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          {address.houseNumber}, {address.formattedAddress}
          {address.landmark && `, Near ${address.landmark}`}
        </p>

        <p className="text-sm leading-6 text-[#6B7280]">
          {address.city}, {address.state} - {address.postalCode}
        </p>

        <p className="text-sm text-[#6B7280]">{address.country}</p>

        <p className="mt-3 text-sm font-medium text-[#242424]">Phone: +91 {address.phone}</p>
      </div>
    </section>
  );
}

function OrderSummary({ order }) {
  const { pricing } = order;

  return (
    <aside className="rounded-2xl border border-[#EDE9E6] bg-white p-5 shadow-[0_8px_30px_rgba(36,36,36,0.05)]">
      <h2 className="font-bold text-[#242424]">Order Summary</h2>

      {/* Status */}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-green-50 px-3 py-2.5">
        <span className="text-xs text-green-700">Order Status</span>

        <span className="flex items-center gap-1 text-xs font-bold text-green-700">
          <Check size={13} />
          {order.orderStatus}
        </span>
      </div>

      <div className="mt-5 space-y-3 border-b border-[#EDE9E6] pb-5 text-sm">
        <SummaryRow label="Items Total" value={pricing.itemsTotal} />

        <SummaryRow label="Delivery" value={pricing.shippingFee} free />

        {pricing.discount > 0 && <SummaryRow label="Discount" value={-pricing.discount} />}

        {pricing.tax > 0 && <SummaryRow label="Tax" value={pricing.tax} />}
      </div>

      <div className="flex items-center justify-between py-5">
        <span className="font-bold text-[#242424]">Total</span>

        <span className="text-xl font-extrabold text-[#242424]">
          ₹{pricing.grandTotal.toLocaleString("en-IN")}
        </span>
      </div>

      <div className="border-t border-[#EDE9E6] pt-4">
        <div className="flex justify-between text-xs">
          <span className="text-[#6B7280]">Payment Method</span>

          <span className="font-semibold text-[#242424]">
            {order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}
          </span>
        </div>

        <div className="mt-3 flex justify-between text-xs">
          <span className="text-[#6B7280]">Payment Status</span>

          <span className="font-semibold text-[#242424]">{order.paymentStatus}</span>
        </div>
      </div>
    </aside>
  );
}

function SummaryRow({ label, value, free = false }) {
  return (
    <div className="flex justify-between">
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

function LoadingState() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FFF9F5]">
      <div className="text-center">
        <Loader2 size={30} className="mx-auto animate-spin text-[#FF5A5F]" />

        <p className="mt-3 text-sm text-[#6B7280]">Loading your order...</p>
      </div>
    </main>
  );
}

function ErrorState({ message }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FFF9F5] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#EDE9E6] bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertCircle size={25} className="text-red-500" />
        </div>

        <h1 className="mt-4 text-xl font-bold text-[#242424]">Unable to load order</h1>

        <p className="mt-2 text-sm text-[#6B7280]">{message}</p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
