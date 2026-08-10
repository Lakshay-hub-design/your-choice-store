"use client";

import { Banknote, Check, CreditCard } from "lucide-react";

export default function CheckoutPayment({ value, onChange }) {
  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-6">
      {/* Header */}
      <div>
        <h2 className="font-bold text-[#242424]">Payment Method</h2>

        <p className="mt-1 text-xs text-[#6B7280]">Choose how you'd like to pay.</p>
      </div>

      <div className="mt-5 space-y-3">
        {/* =========================
            COD
        ========================== */}
        <button
          type="button"
          onClick={() => onChange("COD")}
          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
            value === "COD"
              ? "border-[#FF5A5F] bg-[#FF5A5F]/[0.03] ring-1 ring-[#FF5A5F]/20"
              : "border-[#EDE9E6] hover:border-[#D9D3CF]"
          }`}
        >
          {/* Icon */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              value === "COD" ? "bg-green-50 text-green-600" : "bg-[#F8F8F8] text-[#6B7280]"
            }`}
          >
            <Banknote size={20} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#242424]">Cash on Delivery</p>

            <p className="mt-0.5 text-xs text-[#6B7280]">Pay when your order arrives.</p>
          </div>

          {/* Radio */}
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
              value === "COD" ? "border-[#FF5A5F] bg-[#FF5A5F] text-white" : "border-[#D1D5DB]"
            }`}
          >
            {value === "COD" && <Check size={12} />}
          </div>
        </button>

        {/* =========================
            ONLINE PAYMENT
        ========================== */}
        <button
          type="button"
          onClick={() => onChange("ONLINE")}
          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
            value === "ONLINE"
              ? "border-[#FF5A5F] bg-[#FF5A5F]/[0.03] ring-1 ring-[#FF5A5F]/20"
              : "border-[#EDE9E6] hover:border-[#D9D3CF]"
          }`}
        >
          {/* Icon */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              value === "ONLINE" ? "bg-[#FF5A5F]/10 text-[#FF5A5F]" : "bg-[#F8F8F8] text-[#6B7280]"
            }`}
          >
            <CreditCard size={19} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[#242424]">Online Payment</p>

              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                Secure
              </span>
            </div>

            <p className="mt-0.5 text-xs text-[#6B7280]">
              Pay securely using UPI, cards or net banking.
            </p>
          </div>

          {/* Radio */}
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
              value === "ONLINE" ? "border-[#FF5A5F] bg-[#FF5A5F] text-white" : "border-[#D1D5DB]"
            }`}
          >
            {value === "ONLINE" && <Check size={12} />}
          </div>
        </button>
      </div>
    </section>
  );
}
