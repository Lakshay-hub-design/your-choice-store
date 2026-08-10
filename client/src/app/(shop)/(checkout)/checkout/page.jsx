"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { AlertCircle, ArrowLeft, LockKeyhole } from "lucide-react";

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
      <CheckoutContent />
    </ProtectedRoute>
  );
}

function CheckoutContent() {
  const router = useRouter();

  const [checkout, setCheckout] = useState(null);

  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [paymentData, setPaymentData] = useState(null);

  const [createdOrder, setCreatedOrder] = useState(null);

  const [paymentFailed, setPaymentFailed] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [error, setError] = useState("");

  const idempotencyKeyRef = useRef(null);

  /* ========================================
     LOAD / REFRESH CHECKOUT
  ======================================== */

  const loadCheckout = useCallback(async ({ showLoader = false } = {}) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      }

      setError("");

      const response = await getCheckoutSummary();

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
      const message = error.response?.data?.message || error.message || "Unable to load checkout.";

      setError(message);

      return null;
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, []);

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

          expectedTotal: checkout.pricing.grandTotal,
        },

        idempotencyKeyRef.current
      );

      const data = response.data?.data;

      if (!data) {
        throw new Error("Order information is unavailable.");
      }

      /*
       * ========================================
       * COD
       * ========================================
       */

      if (paymentMethod === "COD") {
        const order = data.order || data;

        if (!order?._id) {
          throw new Error("Order was placed but order information is unavailable.");
        }

        /*
         * COD is already successfully placed.
         */
        useCartStore.getState().resetCart();

        idempotencyKeyRef.current = null;

        router.replace(`/order-success?order=${order._id}`);

        return;
      }

      /*
       * ========================================
       * ONLINE PAYMENT
       * ========================================
       */

      const order = data.order;

      const payment = data.payment;

      if (!order?._id) {
        throw new Error("Order was created but order information is unavailable.");
      }

      if (!payment?.keyId || !payment?.orderId) {
        throw new Error("Payment could not be initialized.");
      }

      /*
       * IMPORTANT:
       *
       * Don't clear cart.
       * Don't navigate to success.
       *
       * Payment is still pending.
       */

      setCreatedOrder(order);

      setPaymentData(payment);

      /*
       * Keep the same idempotency key while
       * this payment is being completed.
       */
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
     CHECKOUT LOAD ERROR
  ======================================== */

  if (!checkout) {
    return <CheckoutError message={error} onBack={() => router.push("/cart")} />;
  }

  return (
    <main className="min-h-screen bg-[#FFF9F5]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Back */}

        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#242424]"
        >
          <ArrowLeft size={17} />
          Back to Cart
        </button>

        {/* Header */}

        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">Checkout</h1>

          <p className="mt-1 text-sm text-[#6B7280]">Complete your order securely.</p>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* LEFT */}

          <div className="space-y-5">
            <CheckoutAddressSection
              addresses={checkout.addresses || []}
              selectedAddressId={selectedAddressId}
              onSelect={setSelectedAddressId}
            />

            <CheckoutPayment value={paymentMethod} onChange={setPaymentMethod} />

            <CheckoutItems items={checkout.items || []} />
          </div>

          {/* RIGHT */}

          <div className="lg:sticky lg:top-6">
            {!paymentData ? (
              <CheckoutSummary
                pricing={checkout.pricing}
                itemCount={checkout.items?.length || 0}
                disabled={!selectedAddressId || isPlacingOrder}
                isPlacingOrder={isPlacingOrder}
                onPlaceOrder={handlePlaceOrder}
              />
            ) : (
              <div className="rounded-2xl border border-[#EDE9E6] bg-white p-5 shadow-sm">
                <div>
                  <p className="text-xs font-medium text-[#6B7280]">Order Total</p>

                  <p className="mt-1 text-2xl font-bold text-[#242424]">
                    ₹{Number(createdOrder?.pricing?.grandTotal || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                {paymentFailed && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                    <p className="text-sm font-semibold text-red-600">Payment failed</p>

                    <p className="mt-1 text-xs leading-5 text-red-500">
                      Your order is still available. You can try the payment again.
                    </p>
                  </div>
                )}

                <div className="mt-5">
                  <RazorpayCheckout
                    payment={paymentData}
                    order={createdOrder}
                    onSuccess={(result) => {
                      /*
                       * Payment has now been verified
                       * by our backend.
                       */

                      const paidOrder = result.data?.order;

                      if (!paidOrder?._id) {
                        toast.error("Payment succeeded, but order information is unavailable.");

                        return;
                      }

                      /*
                       * NOW clear the cart.
                       */
                      useCartStore.getState().resetCart();

                      idempotencyKeyRef.current = null;

                      router.replace(`/order-success?order=${paidOrder._id}`);
                    }}
                    onFailure={(failure) => {
                      if (failure?.type === "PAYMENT_FAILED") {
                        setPaymentFailed(true);
                      }

                      /*
                       * Closing Razorpay doesn't mean
                       * the order is cancelled.
                       */
                    }}
                  />
                </div>

                <button
                  type="button"
                  disabled={isPlacingOrder}
                  onClick={() => {
                    setPaymentData(null);
                    setCreatedOrder(null);
                    setPaymentFailed(false);
                    idempotencyKeyRef.current = null;
                  }}
                  className="mt-3 w-full rounded-xl border border-[#EDE9E6] px-5 py-3 text-sm font-medium text-[#6B7280] transition hover:bg-[#FFF9F5]"
                >
                  Back to Checkout
                </button>
              </div>
            )}

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#9CA3AF]">
              <LockKeyhole size={13} />
              Secure checkout
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-[#FFF9F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-[#EDE9E6]" />

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            {[220, 180, 280].map((height) => (
              <div
                key={height}
                style={{
                  height,
                }}
                className="animate-pulse rounded-2xl border border-[#EDE9E6] bg-white"
              />
            ))}
          </div>

          <div className="h-[380px] animate-pulse rounded-2xl border border-[#EDE9E6] bg-white" />
        </div>
      </div>
    </main>
  );
}

function CheckoutError({ message, onBack }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FFF9F5] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#EDE9E6] bg-white p-8 text-center">
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
          className="mt-6 rounded-xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white"
        >
          Return to Cart
        </button>
      </div>
    </main>
  );
}
