import { Loader2, ShieldCheck } from "lucide-react";

export default function CheckoutSummary({
  pricing,
  itemCount,
  disabled,
  isPlacingOrder,
  onPlaceOrder,
}) {
  return (
    <aside className="rounded-2xl border border-[#EDE9E6] bg-white p-5 shadow-[0_8px_30px_rgba(36,36,36,0.05)] sm:p-6">
      <h2 className="text-lg font-bold text-[#242424]">Order Summary</h2>

      <p className="mt-1 text-xs text-[#6B7280]">
        {itemCount} {itemCount === 1 ? "product" : "products"} in your order
      </p>

      <div className="mt-5 space-y-3 border-b border-[#EDE9E6] pb-5 text-sm">
        <PriceRow label="Items Total" value={pricing.itemsTotal} />

        <PriceRow label="Delivery" value={pricing.shippingFee} freeLabel />

        {pricing.discount > 0 && <PriceRow label="Discount" value={-pricing.discount} />}

        {pricing.tax > 0 && <PriceRow label="Tax" value={pricing.tax} />}
      </div>

      <div className="flex items-center justify-between py-5">
        <span className="font-bold text-[#242424]">Total</span>

        <span className="text-2xl font-extrabold text-[#242424]">
          ₹{pricing.grandTotal.toLocaleString("en-IN")}
        </span>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onPlaceOrder}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(255,90,95,0.18)] transition hover:bg-[#f1494e] disabled:cursor-not-allowed disabled:bg-[#D1D5DB] disabled:shadow-none"
      >
        {isPlacingOrder ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            Placing Order...
          </>
        ) : (
          "Place Order"
        )}
      </button>

      <div className="mt-4 flex items-start gap-2 rounded-xl bg-green-50 p-3">
        <ShieldCheck size={17} className="mt-0.5 shrink-0 text-green-600" />

        <p className="text-[11px] leading-4 text-green-700">
          Your order details are securely processed.
        </p>
      </div>
    </aside>
  );
}

function PriceRow({ label, value, freeLabel = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#6B7280]">{label}</span>

      {freeLabel && value === 0 ? (
        <span className="font-semibold text-green-600">FREE</span>
      ) : (
        <span className="font-medium text-[#242424]">
          {value < 0 && "-"}₹{Math.abs(value).toLocaleString("en-IN")}
        </span>
      )}
    </div>
  );
}
