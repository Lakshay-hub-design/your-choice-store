import { CheckCircle2, Loader2, ShieldCheck, Tag } from "lucide-react";

export default function CheckoutSummary({
  pricing,
  itemCount,
  disabled,
  isPlacingOrder,
  onPlaceOrder,
}) {
  const mrp = pricing.mrpTotal ?? pricing.itemsTotal + (pricing.discount || 0);

  const discount = pricing.discount || 0;
  const shippingFee = pricing.shippingFee || 0;
  const tax = pricing.tax || 0;
  const grandTotal = pricing.grandTotal || 0;

  return (
    <aside className="rounded-2xl border border-[#EDE9E6] bg-white p-5 shadow-[0_8px_30px_rgba(36,36,36,0.05)] sm:p-6">
      {/* ================================
          HEADER
      ================================= */}

      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#242424]">Order Summary</h2>

        <p className="mt-1 text-sm text-[#6B7280]">
          {itemCount} {itemCount === 1 ? "product" : "products"} in your order
        </p>
      </div>

      {/* ================================
          PRICING
      ================================= */}

      <div className="mt-6 space-y-4">
        <PriceRow label="MRP" value={mrp} />

        {discount > 0 && (
          <PriceRow label="Discount" value={-discount} valueClassName="text-green-600" />
        )}

        <PriceRow label="Delivery" value={shippingFee} freeLabel />

        {tax > 0 && (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-[#6B7280]">GST</span>

              <span className="ml-1.5 text-[11px] text-[#9CA3AF]">(included)</span>
            </div>

            <span className="text-sm font-medium text-[#242424]">₹{formatPrice(tax)}</span>
          </div>
        )}
      </div>

      {/* ================================
          SAVINGS
      ================================= */}

      {discount > 0 && (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-green-50 px-3.5 py-3">
          <Tag size={16} className="shrink-0 text-green-600" />

          <p className="text-xs font-medium text-green-700">
            You save ₹{formatPrice(discount)} on this order
          </p>
        </div>
      )}

      {/* ================================
          DIVIDER
      ================================= */}

      <div className="my-5 border-t border-[#EDE9E6]" />

      {/* ================================
          TOTAL
      ================================= */}

      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="text-base font-bold text-[#242424]">Total</span>

          <p className="mt-0.5 text-[11px] text-[#9CA3AF]">Inclusive of applicable taxes</p>
        </div>

        <span className="text-2xl font-extrabold tracking-tight text-[#242424] sm:text-3xl">
          ₹{formatPrice(grandTotal)}
        </span>
      </div>

      {/* ================================
          PLACE ORDER
      ================================= */}

      <button
        type="button"
        disabled={disabled}
        onClick={onPlaceOrder}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(255,90,95,0.18)] transition hover:bg-[#f1494e] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#D1D5DB] disabled:shadow-none"
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

      {/* ================================
          SECURITY
      ================================= */}

      <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-green-50 p-3.5">
        <ShieldCheck size={17} className="mt-0.5 shrink-0 text-green-600" />

        <div>
          <p className="text-xs font-medium text-green-700">Secure checkout</p>

          <p className="mt-0.5 text-[11px] leading-4 text-green-600">
            Your order and payment details are securely processed.
          </p>
        </div>
      </div>
    </aside>
  );
}

/* ================================
   PRICE ROW
================================ */

function PriceRow({ label, value, freeLabel = false, valueClassName = "" }) {
  const isNegative = value < 0;
  const isFree = freeLabel && value === 0;

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-[#6B7280]">{label}</span>

      {isFree ? (
        <span className="text-sm font-semibold text-green-600">FREE</span>
      ) : (
        <span className={`text-sm font-medium text-[#242424] ${valueClassName}`}>
          {isNegative ? "-" : ""}₹{formatPrice(Math.abs(value))}
        </span>
      )}
    </div>
  );
}

/* ================================
   CURRENCY FORMATTER
================================ */

function formatPrice(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
