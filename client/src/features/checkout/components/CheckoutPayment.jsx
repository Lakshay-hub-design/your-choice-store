"use client";

import { Banknote, Check, CreditCard, Info, ShieldCheck } from "lucide-react";

export default function CheckoutPayment({ value, onChange }) {
  return (
    <div>
      {/* ================================
          PAYMENT OPTIONS
      ================================= */}

      <div className="space-y-3">
        {/* =========================
            COD
        ========================== */}

        <button
          type="button"
          onClick={() => onChange("COD")}
          className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
            value === "COD"
              ? "border-[#FF5A5F] bg-[#FFF9F9] shadow-[0_4px_16px_rgba(255,90,95,0.07)] ring-1 ring-[#FF5A5F]/20"
              : "border-[#EDE9E6] bg-white hover:border-[#FFB5B7] hover:shadow-[0_4px_16px_rgba(36,36,36,0.04)]"
          }`}
        >
          {/* Icon */}

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
              value === "COD" ? "bg-[#FF5A5F]/10 text-[#FF5A5F]" : "bg-[#F7F5F3] text-[#6B7280]"
            }`}
          >
            <Banknote size={20} />
          </div>

          {/* Content */}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[#242424]">Cash on Delivery</p>

              <span className="rounded-full bg-[#FFF7E6] px-2 py-0.5 text-[10px] font-semibold text-[#B77900]">
                Pay on delivery
              </span>
            </div>

            <p className="mt-1 text-xs leading-5 text-[#6B7280]">
              Pay when your order arrives at your doorstep.
            </p>
          </div>

          {/* Radio */}

          <RadioIndicator selected={value === "COD"} />
        </button>

        {/* =========================
            ONLINE PAYMENT
        ========================== */}

        <button
          type="button"
          onClick={() => onChange("ONLINE")}
          className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
            value === "ONLINE"
              ? "border-[#FF5A5F] bg-[#FFF9F9] shadow-[0_4px_16px_rgba(255,90,95,0.07)] ring-1 ring-[#FF5A5F]/20"
              : "border-[#EDE9E6] bg-white hover:border-[#FFB5B7] hover:shadow-[0_4px_16px_rgba(36,36,36,0.04)]"
          }`}
        >
          {/* Icon */}

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
              value === "ONLINE" ? "bg-[#FF5A5F]/10 text-[#FF5A5F]" : "bg-[#F7F5F3] text-[#6B7280]"
            }`}
          >
            <CreditCard size={20} />
          </div>

          {/* Content */}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[#242424]">Online Payment</p>

              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                <ShieldCheck size={11} />
                Secure
              </span>
            </div>

            <p className="mt-1 text-xs leading-5 text-[#6B7280]">
              Pay securely using UPI, cards or net banking.
            </p>
          </div>

          {/* Radio */}

          <RadioIndicator selected={value === "ONLINE"} />
        </button>
      </div>

      {/* ================================
          SHIPPING INFO
      ================================= */}

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#F2E4C8] bg-[#FFFBF2] p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF1CC]">
          <Info size={16} className="text-[#B77900]" />
        </div>

        <div>
          <p className="text-xs font-semibold text-[#7A5700]">Save on delivery charges</p>

          <p className="mt-1 text-[11px] leading-5 text-[#8A6A25]">
            COD may have higher delivery charges. Pay online to get lower shipping charges where
            available.
          </p>
        </div>
      </div>

      {/* ================================
          SECURE PAYMENT NOTE
      ================================= */}

      {value === "ONLINE" && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 px-3.5 py-3">
          <ShieldCheck size={15} className="shrink-0 text-green-600" />

          <p className="text-[11px] leading-4 text-green-700">
            Your payment is securely processed through Razorpay. We never store your card details.
          </p>
        </div>
      )}
    </div>
  );
}

/* ========================================
   RADIO INDICATOR
======================================== */

function RadioIndicator({ selected }) {
  return (
    <div
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
        selected ? "border-[#FF5A5F] bg-[#FF5A5F] text-white" : "border-[#D1D5DB] bg-white"
      }`}
    >
      {selected && <Check size={12} strokeWidth={3} />}
    </div>
  );
}
