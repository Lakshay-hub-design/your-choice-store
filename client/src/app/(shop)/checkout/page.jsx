"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AlertCircle, ArrowLeft, Loader2, LockKeyhole, MapPin } from "lucide-react";

import { getCheckoutSummary, placeOrder } from "@/features/checkout/services/checkoutService";

import useCartStore from "@/store/cartStore";

import CheckoutAddressSection from "@/features/checkout/components/CheckoutAddressSection";
import CheckoutItems from "@/features/checkout/components/CheckoutItems";
import CheckoutPayment from "@/features/checkout/components/CheckoutPayment";
import CheckoutSummary from "@/features/checkout/components/CheckoutSummary";

export default function CheckoutPage() {
  const router = useRouter();

  const [checkout, setCheckout] = useState(null);

  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [isLoading, setIsLoading] = useState(true);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadCheckout = async () => {
      try {
        setError("");

        const response = await getCheckoutSummary();

        const data = response.data?.data;

        setCheckout(data);

        if (data?.defaultAddress?._id) {
          setSelectedAddressId(data.defaultAddress._id);
        } else if (data?.addresses?.length) {
          setSelectedAddressId(data.addresses[0]._id);
        }
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load checkout.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCheckout();
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError("Please select a delivery address.");

      return;
    }

    if (isPlacingOrder) return;

    setError("");
    setIsPlacingOrder(true);

    try {
      const response = await placeOrder({
        addressId: selectedAddressId,
        paymentMethod,
      });

      const order = response.data?.data;

      /*
       * Backend cleared the cart,
       * so synchronize frontend Zustand.
       */
      useCartStore.getState().resetCart();

      router.replace(`/order-success?order=${order._id}`);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to place your order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return <CheckoutLoading />;
  }

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
              addresses={checkout.addresses}
              selectedAddressId={selectedAddressId}
              onSelect={setSelectedAddressId}
            />

            <CheckoutPayment value={paymentMethod} onChange={setPaymentMethod} />

            <CheckoutItems items={checkout.items} />
          </div>

          {/* RIGHT */}
          <div className="lg:sticky lg:top-6">
            <CheckoutSummary
              pricing={checkout.pricing}
              itemCount={checkout.items.length}
              disabled={!selectedAddressId || isPlacingOrder}
              isPlacingOrder={isPlacingOrder}
              onPlaceOrder={handlePlaceOrder}
            />

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
