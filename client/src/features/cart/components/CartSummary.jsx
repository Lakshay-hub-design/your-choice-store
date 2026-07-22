"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";

export default function CartSummary({ subtotal, savings, itemCount, onCheckout }) {
  return (
    <div className="rounded-2xl border border-[#EDE9E6] bg-white p-5 lg:sticky lg:top-6">
      <h2 className="text-lg font-bold text-[#242424]">Order Summary</h2>

      <div className="mt-5 space-y-4 text-sm">
        <div className="flex justify-between gap-4 text-[#6B7280]">
          <span>
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>

          <span className="font-medium text-[#242424]">₹{subtotal.toLocaleString("en-IN")}</span>
        </div>

        {savings > 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-[#6B7280]">Your Savings</span>

            <span className="font-semibold text-green-600">
              -₹{savings.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        <div className="flex justify-between gap-4 text-[#6B7280]">
          <span>Delivery</span>

          <span className="text-xs font-medium text-[#6B7280]">Calculated at checkout</span>
        </div>
      </div>

      <div className="my-5 border-t border-dashed border-[#EDE9E6]" />

      <div className="flex items-center justify-between">
        <span className="font-bold text-[#242424]">Total</span>

        <span className="text-xl font-bold text-[#242424]">
          ₹{subtotal.toLocaleString("en-IN")}
        </span>
      </div>

      {savings > 0 && (
        <div className="mt-3 rounded-xl bg-green-50 px-3 py-2 text-center text-xs font-semibold text-green-700">
          You save ₹{savings.toLocaleString("en-IN")} on this order
        </div>
      )}

      <button
        type="button"
        onClick={onCheckout}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_5px_15px_rgba(255,90,95,0.18)] transition hover:bg-[#f1494e]"
      >
        Proceed to Checkout
        <ArrowRight size={17} />
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#6B7280]">
        <ShieldCheck size={15} className="text-green-600" />
        Secure checkout
      </div>
    </div>
  );
}
