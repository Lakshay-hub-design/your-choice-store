"use client";

import { ReceiptText } from "lucide-react";

const GST_RATES = [
  { value: "0", label: "0% — Nil / Exempt" },
  { value: "3", label: "3% GST" },
  { value: "5", label: "5% GST" },
  { value: "12", label: "12% GST" },
  { value: "18", label: "18% GST" },
  { value: "28", label: "28% GST" },
];

export default function ProductTaxSection({ tax, updateTax }) {
  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C5CFC]/10 text-[#7C5CFC]">
          <ReceiptText size={19} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-[#242424]">Tax / GST</h2>

          <p className="mt-0.5 text-sm text-[#6B7280]">
            Select the GST rate applicable to this product.
          </p>
        </div>
      </div>

      <div className="max-w-md">
        <label htmlFor="tax-rate" className="mb-2 block text-sm font-medium text-[#242424]">
          GST Rate <span className="text-red-500">*</span>
        </label>

        <select
          id="tax-rate"
          value={tax?.rate ?? ""}
          onChange={(event) => updateTax(event.target.value)}
          className="w-full rounded-xl border border-[#EDE9E6] bg-white px-4 py-3 text-sm text-[#242424] transition outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/10"
        >
          <option value="" disabled>
            Select GST rate
          </option>

          {GST_RATES.map((rate) => (
            <option key={rate.value} value={rate.value}>
              {rate.label}
            </option>
          ))}
        </select>

        <p className="mt-2 text-xs text-[#6B7280]">
          The selected GST rate will be used to calculate the GST included in the product selling
          price.
        </p>
      </div>
    </section>
  );
}
