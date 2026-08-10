"use client";

import { useState } from "react";

import { toast } from "sonner";

import { loadRazorpay } from "@/lib/razorpay";

import { verifyOnlinePayment } from "@/features/checkout/services/checkoutService";

export default function RazorpayCheckout({ payment, order, customer, onSuccess, onFailure }) {
  const [loading, setLoading] = useState(false);

  const openCheckout = async () => {
    if (loading) {
      return;
    }

    if (!payment?.keyId) {
      toast.error("Payment could not be initialized.");

      return;
    }

    if (!payment?.orderId) {
      toast.error("Payment order is missing.");

      return;
    }

    try {
      setLoading(true);

      /*
       * Load Razorpay Checkout.
       */
      await loadRazorpay();

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout is unavailable.");
      }

      /*
       * Razorpay Checkout options.
       */
      const options = {
        key: payment.keyId,

        amount: payment.amount,

        currency: payment.currency || "INR",

        name: "YC Gifts & Toys",

        description: `Order ${order?.orderNumber || ""}`,

        order_id: payment.orderId,

        /*
         * Customer information.
         */
        prefill: {
          name: customer?.name || order?.shippingAddress?.fullName || "",

          email: customer?.email || "",

          contact: customer?.phone || order?.shippingAddress?.phone || "",
        },

        /*
         * Theme matching your storefront.
         */
        theme: {
          color: "#FF5A5F",
        },

        /*
         * Allow Razorpay to handle
         * retrying payment attempts.
         */
        retry: {
          enabled: true,
          max_count: 4,
        },

        /*
         * Don't accidentally close the
         * checkout without confirmation.
         */
        modal: {
          confirm_close: true,

          escape: true,

          backdropclose: false,

          animation: true,

          ondismiss: () => {
            setLoading(false);

            onFailure?.({
              type: "DISMISSED",
            });
          },
        },

        /*
         * Successful Razorpay payment.
         */
        handler: async (response) => {
          try {
            /*
             * IMPORTANT:
             *
             * Do NOT mark the order as paid
             * here.
             *
             * Send the Razorpay response
             * to our backend.
             */
            const result = await verifyOnlinePayment({
              razorpay_order_id: response.razorpay_order_id,

              razorpay_payment_id: response.razorpay_payment_id,

              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment successful!");

            onSuccess?.(result);
          } catch (error) {
            console.error("Payment verification failed:", error);

            toast.error(
              error.response?.data?.message ||
                "Payment verification failed. Please check your order."
            );

            onFailure?.({
              type: "VERIFICATION_FAILED",

              error,
            });
          } finally {
            setLoading(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      /*
       * Razorpay payment failure.
       *
       * We don't mark the order as
       * permanently failed here because
       * the customer can retry.
       */
      razorpay.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response?.error);

        setLoading(false);

        onFailure?.({
          type: "PAYMENT_FAILED",

          error: response?.error,
        });
      });

      /*
       * Open only as a result of the
       * customer's action.
       */
      razorpay.open();
    } catch (error) {
      console.error("Unable to open Razorpay:", error);

      toast.error(error.message || "Unable to open payment gateway.");

      setLoading(false);

      onFailure?.({
        type: "CHECKOUT_ERROR",

        error,
      });
    }
  };

  return (
    <button
      type="button"
      onClick={openCheckout}
      disabled={loading}
      className="flex w-full items-center justify-center rounded-xl bg-[#FF5A5F] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#f04f54] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading
        ? "Opening Payment..."
        : `Pay ₹${Number(order?.pricing?.grandTotal || 0).toLocaleString("en-IN")}`}
    </button>
  );
}
