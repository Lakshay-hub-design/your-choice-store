import Image from "next/image";
import Link from "next/link";

export default function CheckoutItems({ items }) {
  return (
    <div className="divide-y divide-[#EDE9E6]">
      {items.map((item) => {
        const price = Number(item.price || 0);
        const comparePrice = Number(item.comparePrice || 0);
        const quantity = Number(item.quantity || 0);
        const subtotal = Number(item.subtotal || price * quantity);

        const hasDiscount = comparePrice > price;

        const itemDiscount = hasDiscount ? Math.max(0, (comparePrice - price) * quantity) : 0;

        return (
          <div key={item.product} className="flex gap-4 py-5 first:pt-0 last:pb-0">
            {/* ================================
                PRODUCT IMAGE
            ================================= */}

            <Link
              href={`/products/${item.slug}`}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#EDE9E6] bg-[#FFF9F5] sm:h-24 sm:w-24"
            >
              <Image
                src={item.image || "/images/product-placeholder.png"}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 80px, 96px"
                className="object-cover transition duration-300 hover:scale-105"
              />
            </Link>

            {/* ================================
                PRODUCT DETAILS
            ================================= */}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="line-clamp-2 text-sm leading-5 font-semibold text-[#242424] transition hover:text-[#FF5A5F]">
                      {item.name}
                    </h3>
                  </Link>

                  {item.sku && (
                    <p className="mt-1 text-[10px] tracking-wide text-[#9CA3AF] uppercase">
                      SKU: {item.sku}
                    </p>
                  )}
                </div>

                {/* ITEM TOTAL */}

                <span className="shrink-0 text-sm font-bold text-[#242424]">
                  ₹{formatPrice(subtotal)}
                </span>
              </div>

              {/* ================================
                  PRICE + QUANTITY
              ================================= */}

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#242424]">
                    ₹{formatPrice(price)}
                  </span>

                  {hasDiscount && (
                    <span className="text-xs text-[#9CA3AF] line-through">
                      ₹{formatPrice(comparePrice)}
                    </span>
                  )}
                </div>

                <span className="h-1 w-1 rounded-full bg-[#D1D5DB]" />

                <span className="text-xs text-[#6B7280]">Qty: {quantity}</span>
              </div>

              {/* ================================
                  DISCOUNT
              ================================= */}

              {itemDiscount > 0 && (
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-700">
                    You save ₹{formatPrice(itemDiscount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ========================================
   PRICE FORMATTER
======================================== */

function formatPrice(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
