"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { toast } from "sonner";

import { getCheckoutSummary, placeOrder } from "@/features/checkout/services/checkoutService";

import useCartStore from "@/store/cartStore";

import CheckoutAddressSection from "@/features/checkout/components/CheckoutAddressSection";
import CheckoutItems from "@/features/checkout/components/CheckoutItems";
import CheckoutPayment from "@/features/checkout/components/CheckoutPayment";
import CheckoutSummary from "@/features/checkout/components/CheckoutSummary";
import RazorpayCheckout from "@/features/checkout/components/RazorpayCheckout";

import ProtectedRoute from "@/features/auth/ProtectedRoute";

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<CheckoutLoading />}>
        <CheckoutContent />
      </Suspense>
    </ProtectedRoute>
  );
}

function CheckoutContent() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const productId = searchParams.get("productId");

  const [checkout, setCheckout] = useState(null);

  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [paymentData, setPaymentData] = useState(null);

  const [createdOrder, setCreatedOrder] = useState(null);

  const [isRefreshingShipping, setIsRefreshingShipping] = useState(false);

  const [shippingError, setShippingError] = useState("");

  const shippingRequestIdRef = useRef(0);

  const [paymentFailed, setPaymentFailed] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [error, setError] = useState("");

  const idempotencyKeyRef = useRef(null);

  /* ========================================
     LOAD / REFRESH CHECKOUT
  ======================================== */

  const loadCheckout = useCallback(
    async ({ showLoader = false } = {}) => {
      try {
        if (showLoader) {
          setIsLoading(true);
        }

        setError("");

        const response = await getCheckoutSummary({
          productId,
        });

        const data = response.data?.data;

        if (!data) {
          throw new Error("Checkout data is unavailable.");
        }

        setCheckout(data);

        setSelectedAddressId((currentAddressId) => {
          const addressStillExists = data.addresses?.some(
            (address) => address._id === currentAddressId
          );

          if (addressStillExists) {
            return currentAddressId;
          }

          if (data.defaultAddress?._id) {
            return data.defaultAddress._id;
          }

          if (data.addresses?.length) {
            return data.addresses[0]._id;
          }

          return null;
        });

        return data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Unable to load checkout.";

        setError(message);

        return null;
      } finally {
        if (showLoader) {
          setIsLoading(false);
        }
      }
    },
    [productId]
  );

  useEffect(() => {
    idempotencyKeyRef.current = null;
  }, [productId]);

  /* ========================================
     REFRESH SHIPPING QUOTE
  ======================================== */

  useEffect(() => {
    if (!selectedAddressId) {
      return;
    }

    let cancelled = false;

    const requestId = ++shippingRequestIdRef.current;

    const refreshShipping = async () => {
      try {
        setIsRefreshingShipping(true);
        setShippingError("");

        const response = await getCheckoutSummary({
          addressId: selectedAddressId,
          paymentMethod,
          productId,
        });

        const data = response.data?.data;

        if (!data) {
          throw new Error("Unable to calculate delivery charges.");
        }

        if (cancelled || requestId !== shippingRequestIdRef.current) {
          return;
        }

        setCheckout(data);
      } catch (error) {
        if (cancelled || requestId !== shippingRequestIdRef.current) {
          return;
        }

        const message =
          error.response?.data?.message || error.message || "Unable to calculate delivery charges.";

        setShippingError(message);

        toast.error("Unable to calculate delivery", {
          description: message,
        });
      } finally {
        if (!cancelled && requestId === shippingRequestIdRef.current) {
          setIsRefreshingShipping(false);
        }
      }
    };

    refreshShipping();

    return () => {
      cancelled = true;
    };
  }, [selectedAddressId, paymentMethod, productId]);

  /* ========================================
     INITIAL CHECKOUT
  ======================================== */

  useEffect(() => {
    const initializeCheckout = async () => {
      await loadCheckout();

      setIsLoading(false);
    };

    initializeCheckout();
  }, [loadCheckout]);

  /* ========================================
     PLACE ORDER
  ======================================== */

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) {
      return;
    }

    if (!selectedAddressId) {
      setError("Please select a delivery address.");

      return;
    }

    if (!checkout?.pricing) {
      setError("Checkout information is unavailable. Please refresh the page.");

      return;
    }

    if (isRefreshingShipping) {
      setError("Please wait while we calculate delivery charges.");

      return;
    }

    if (shippingError) {
      setError("Please select a valid delivery address before placing your order.");

      return;
    }

    setError("");
    setPaymentFailed(false);
    setIsPlacingOrder(true);

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    try {
      const response = await placeOrder(
        {
          addressId: selectedAddressId,
          paymentMethod,

          ...(productId ? { productId } : {}),

          expectedTotal: checkout.pricing.grandTotal,
        },
        idempotencyKeyRef.current
      );

      const data = response.data?.data;

      if (!data) {
        throw new Error("Order information is unavailable.");
      }

      /* ========================================
         COD
      ======================================== */

      if (paymentMethod === "COD") {
        const order = data.order || data;

        if (!order?._id) {
          throw new Error("Order was placed but order information is unavailable.");
        }

        await useCartStore.getState().fetchCart();

        idempotencyKeyRef.current = null;

        router.replace(`/order-success?order=${order._id}`);

        return;
      }

      /* ========================================
         ONLINE PAYMENT
      ======================================== */

      const order = data.order;

      const payment = data.payment;

      if (!order?._id) {
        throw new Error("Order was created but order information is unavailable.");
      }

      if (!payment?.keyId || !payment?.orderId) {
        throw new Error("Payment could not be initialized.");
      }

      /*
       * Payment is still pending.
       *
       * Keep cart and idempotency key.
       */

      setCreatedOrder(order);

      setPaymentData(payment);

      setPaymentFailed(false);
    } catch (error) {
      const status = error.response?.status;

      const message =
        error.response?.data?.message || error.message || "Unable to place your order.";

      if (status === 409) {
        idempotencyKeyRef.current = null;

        const updatedCheckout = await loadCheckout();

        toast.warning("Your cart has changed", {
          description: message || "Please review your updated order before placing it again.",
        });

        if (!updatedCheckout) {
          setError(
            "Your cart changed, but we couldn't refresh checkout. Please return to your cart."
          );
        }

        return;
      }

      if (status === 404 && message === "Address not found") {
        idempotencyKeyRef.current = null;

        const updatedCheckout = await loadCheckout();

        toast.error("Delivery address unavailable", {
          description: "Please select another delivery address.",
        });

        if (!updatedCheckout) {
          setError("Unable to refresh your delivery addresses.");
        }

        return;
      }

      if (status === 400) {
        idempotencyKeyRef.current = null;

        setError(message);

        toast.error(message);

        return;
      }

      setError(message);

      toast.error("Unable to confirm your order", {
        description: "Please try again. Your checkout is protected against duplicate orders.",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  /* ========================================
     LOADING
  ======================================== */

  if (isLoading) {
    return <CheckoutLoading />;
  }

  /* ========================================
     CHECKOUT ERROR
  ======================================== */

  if (!checkout) {
    return <CheckoutError message={error} onBack={() => router.push("/cart")} />;
  }

  /* ========================================
     ITEM COUNT
  ======================================== */

  const itemCount =
    checkout.items?.reduce((total, item) => total + Number(item.quantity || 0), 0) || 0;

  /* ========================================
     MAIN CHECKOUT
  ======================================== */

  return (
    <main className="min-h-screen bg-[#FFF9F5]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* ==================================
            HEADER
        ================================== */}

        <div className="mb-7">
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#242424]"
          >
            <ArrowLeft size={17} />
            Back to Cart
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#242424] sm:text-4xl">
                Checkout
              </h1>

              <p className="mt-1.5 text-sm text-[#6B7280]">
                Review your order and complete your purchase.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3.5 py-2 text-xs font-medium text-green-700">
              <LockKeyhole size={14} />
              Secure checkout
            </div>
          </div>
        </div>

        {/* ==================================
            PROGRESS
        ================================== */}

        <CheckoutProgress paymentCompleted={Boolean(paymentData)} />

        {/* ==================================
            ERROR
        ================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-medium">Something needs your attention</p>

              <p className="mt-0.5 leading-5">{error}</p>
            </div>
          </div>
        )}

        {/* ==================================
            MAIN GRID
        ================================== */}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* ==================================
              LEFT COLUMN
          ================================== */}

          <div className="space-y-5">
            {/* DELIVERY */}
            <CheckoutSection
              number="01"
              title="Delivery Address"
              description="Choose where you want your order delivered."
            >
              <CheckoutAddressSection
                addresses={checkout.addresses || []}
                selectedAddressId={selectedAddressId}
                onSelect={(addressId) => {
                  if (paymentData || addressId === selectedAddressId) {
                    return;
                  }

                  setShippingError("");

                  setSelectedAddressId(addressId);
                }}
              />
            </CheckoutSection>

            {/* PAYMENT */}
            <CheckoutSection
              number="02"
              title="Payment Method"
              description="Select how you would like to pay."
            >
              <CheckoutPayment
                value={paymentMethod}
                onChange={(method) => {
                  if (paymentData || method === paymentMethod) {
                    return;
                  }

                  setShippingError("");

                  setPaymentMethod(method);
                }}
              />

              {isRefreshingShipping && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#FFF9F5] px-4 py-3 text-xs text-[#6B7280]">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#EDE9E6] border-t-[#FF5A5F]" />
                  Updating delivery charges...
                </div>
              )}
            </CheckoutSection>

            {/* ITEMS */}
            <CheckoutSection
              number="03"
              title="Order Items"
              description={`${itemCount} ${itemCount === 1 ? "item" : "items"} in your order.`}
            >
              <CheckoutItems items={checkout.items || []} />
            </CheckoutSection>
          </div>

          {/* ==================================
              RIGHT COLUMN
          ================================== */}

          <div className="lg:sticky lg:top-8">
            {!paymentData ? (
              <CheckoutSummary
                pricing={checkout.pricing}
                itemCount={itemCount}
                disabled={
                  !selectedAddressId ||
                  isPlacingOrder ||
                  isRefreshingShipping ||
                  Boolean(shippingError)
                }
                isPlacingOrder={isPlacingOrder || isRefreshingShipping}
                onPlaceOrder={handlePlaceOrder}
              />
            ) : (
              <PaymentCard
                order={createdOrder}
                paymentFailed={paymentFailed}
                paymentData={paymentData}
                isPlacingOrder={isPlacingOrder}
                onSuccess={async (result) => {
                  const paidOrder = result.data?.order;

                  if (!paidOrder?._id) {
                    toast.error("Payment succeeded, but order information is unavailable.");

                    return;
                  }

                  await useCartStore.getState().fetchCart();

                  idempotencyKeyRef.current = null;

                  router.replace(`/order-success?order=${paidOrder._id}`);
                }}
                onFailure={(failure) => {
                  if (failure?.type === "PAYMENT_FAILED") {
                    setPaymentFailed(true);
                  }
                }}
                onBack={() => {
                  setPaymentData(null);
                  setCreatedOrder(null);
                  setPaymentFailed(false);
                  idempotencyKeyRef.current = null;
                }}
              />
            )}

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#9CA3AF]">
              <LockKeyhole size={13} />

              <span>Secure & encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ========================================
   CHECKOUT SECTION
======================================== */

function CheckoutSection({ number, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white shadow-[0_4px_24px_rgba(36,36,36,0.035)]">
      <div className="border-b border-[#EDE9E6] px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF1F1] text-xs font-bold text-[#FF5A5F]">
            {number}
          </div>

          <div>
            <h2 className="text-base font-bold text-[#242424]">{title}</h2>

            <p className="mt-0.5 text-xs leading-5 text-[#6B7280]">{description}</p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

/* ========================================
   CHECKOUT PROGRESS
======================================== */

function CheckoutProgress({ paymentCompleted }) {
  return (
    <div className="mb-7 rounded-2xl border border-[#EDE9E6] bg-white px-4 py-4 shadow-[0_4px_20px_rgba(36,36,36,0.03)] sm:px-6">
      <div className="flex items-center">
        <ProgressStep number="1" label="Delivery" active completed />

        <ProgressLine active />

        <ProgressStep number="2" label="Payment" active completed={paymentCompleted} />

        <ProgressLine active={paymentCompleted} />

        <ProgressStep number="3" label="Confirmation" active={paymentCompleted} />
      </div>
    </div>
  );
}

function ProgressStep({ number, label, active = false, completed = false }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
          completed
            ? "bg-[#FF5A5F] text-white"
            : active
              ? "border-2 border-[#FF5A5F] bg-white text-[#FF5A5F]"
              : "bg-[#F3F4F6] text-[#9CA3AF]"
        }`}
      >
        {completed ? <Check size={15} /> : number}
      </div>

      <span
        className={`hidden text-xs font-semibold sm:block ${
          active ? "text-[#242424]" : "text-[#9CA3AF]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function ProgressLine({ active = false }) {
  return (
    <div
      className={`mx-2 h-px flex-1 transition sm:mx-4 ${active ? "bg-[#FFB5B7]" : "bg-[#EDE9E6]"}`}
    />
  );
}

/* ========================================
   PAYMENT CARD
======================================== */

function PaymentCard({
  order,
  paymentFailed,
  paymentData,
  isPlacingOrder,
  onSuccess,
  onFailure,
  onBack,
}) {
  const total = Number(order?.pricing?.grandTotal) || 0;

  const discount = Number(order?.pricing?.discount) || 0;

  const shipping = Number(order?.pricing?.shippingFee) || 0;

  const tax = Number(order?.pricing?.tax) || 0;

  const mrp =
    Number(order?.pricing?.mrpTotal) || Number(order?.pricing?.itemsTotal || 0) + discount;

  return (
    <aside className="overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white shadow-[0_8px_30px_rgba(36,36,36,0.05)]">
      {/* Header */}

      <div className="border-b border-[#EDE9E6] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#242424]">Order Ready</h2>

            <p className="mt-0.5 text-xs text-[#6B7280]">Complete your secure payment.</p>
          </div>
        </div>
      </div>

      {/* Amount */}

      <div className="px-5 py-5 sm:px-6">
        <div className="rounded-2xl bg-[#FFF9F5] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B7280]">Amount to pay</span>

            <span className="text-2xl font-extrabold tracking-tight text-[#242424]">
              ₹{formatPrice(total)}
            </span>
          </div>

          <div className="mt-4 space-y-2.5 border-t border-[#EDE9E6] pt-4">
            <MiniPriceRow label="MRP" value={mrp} />

            {discount > 0 && <MiniPriceRow label="Discount" value={-discount} green />}

            <MiniPriceRow label="Delivery" value={shipping} free={shipping === 0} />

            {tax > 0 && <MiniPriceRow label="GST included" value={tax} />}
          </div>
        </div>

        {/* Payment failure */}

        {paymentFailed && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={17} className="mt-0.5 shrink-0 text-red-500" />

              <div>
                <p className="text-sm font-semibold text-red-600">Payment failed</p>

                <p className="mt-1 text-xs leading-5 text-red-500">
                  Your order is still available. You can safely try the payment again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Razorpay */}

        <div className="mt-5">
          <RazorpayCheckout
            payment={paymentData}
            order={order}
            onSuccess={onSuccess}
            onFailure={onFailure}
          />
        </div>

        {/* Back */}

        <button
          type="button"
          disabled={isPlacingOrder}
          onClick={onBack}
          className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-[#EDE9E6] px-5 text-sm font-medium text-[#6B7280] transition hover:bg-[#FFF9F5] hover:text-[#242424] disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Back to Checkout
        </button>

        {/* Trust */}

        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-green-50 p-3.5">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-green-600" />

          <div>
            <p className="text-xs font-medium text-green-700">Secure payment</p>

            <p className="mt-0.5 text-[11px] leading-4 text-green-600">
              Payment is securely processed through Razorpay.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ========================================
   MINI PRICE ROW
======================================== */

function MiniPriceRow({ label, value, green = false, free = false }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-[#6B7280]">{label}</span>

      {free ? (
        <span className="font-semibold text-green-600">FREE</span>
      ) : (
        <span className={green ? "font-medium text-green-600" : "font-medium text-[#242424]"}>
          {value < 0 ? "-" : ""}₹{formatPrice(Math.abs(value))}
        </span>
      )}
    </div>
  );
}

/* ========================================
   LOADING
======================================== */

function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-[#FFF9F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-4 w-28 animate-pulse rounded bg-[#EDE9E6]" />

        <div className="mt-4 h-9 w-44 animate-pulse rounded-lg bg-[#EDE9E6]" />

        <div className="mt-7 h-16 animate-pulse rounded-2xl border border-[#EDE9E6] bg-white" />

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            {[240, 200, 300].map((height) => (
              <div
                key={height}
                style={{ height }}
                className="animate-pulse rounded-2xl border border-[#EDE9E6] bg-white"
              />
            ))}
          </div>

          <div className="h-[430px] animate-pulse rounded-2xl border border-[#EDE9E6] bg-white" />
        </div>
      </div>
    </main>
  );
}

/* ========================================
   ERROR
======================================== */

function CheckoutError({ message, onBack }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FFF9F5] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#EDE9E6] bg-white p-8 text-center shadow-[0_8px_30px_rgba(36,36,36,0.05)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertCircle size={25} className="text-red-500" />
        </div>

        <h1 className="mt-4 text-xl font-bold text-[#242424]">Unable to checkout</h1>

        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          {message || "Something went wrong while preparing your checkout."}
        </p>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded-xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#f1494e]"
        >
          Return to Cart
        </button>
      </div>
    </main>
  );
}

/* ========================================
   PRICE FORMATTER
======================================== */

function formatPrice(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
