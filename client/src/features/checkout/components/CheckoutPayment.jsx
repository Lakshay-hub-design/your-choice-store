import { Banknote, Check, CreditCard } from "lucide-react";

export default function CheckoutPayment({ value, onChange }) {
  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <CreditCard size={19} className="text-[#7C5CFC]" />

        <h2 className="font-bold text-[#242424]">Payment Method</h2>
      </div>

      <p className="mt-1 text-xs text-[#6B7280]">Choose how you'd like to pay.</p>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => onChange("COD")}
          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
            value === "COD"
              ? "border-[#FF5A5F] bg-[#FF5A5F]/[0.03] ring-1 ring-[#FF5A5F]/20"
              : "border-[#EDE9E6]"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <Banknote size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#242424]">Cash on Delivery</p>

            <p className="mt-0.5 text-xs text-[#6B7280]">Pay when your order arrives.</p>
          </div>

          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
              value === "COD" ? "border-[#FF5A5F] bg-[#FF5A5F] text-white" : "border-[#D1D5DB]"
            }`}
          >
            {value === "COD" && <Check size={12} />}
          </div>
        </button>

        {/* Online payment later */}
        <div className="mt-3 flex items-center gap-4 rounded-xl border border-[#EDE9E6] bg-[#F8F8F8] p-4 opacity-60">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
            <CreditCard size={19} className="text-[#6B7280]" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#242424]">Online Payment</p>

            <p className="text-xs text-[#6B7280]">Coming soon</p>
          </div>
        </div>
      </div>
    </section>
  );
}
