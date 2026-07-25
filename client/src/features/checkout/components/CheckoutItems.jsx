import Image from "next/image";
import Link from "next/link";

import { Package } from "lucide-react";

export default function CheckoutItems({ items }) {
  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Package size={19} className="text-[#FFC83D]" />

        <h2 className="font-bold text-[#242424]">Order Items</h2>

        <span className="text-xs text-[#9CA3AF]">({items.length})</span>
      </div>

      <div className="mt-5 divide-y divide-[#EDE9E6]">
        {items.map((item) => (
          <div key={item.product} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <Link
              href={`/products/${item.slug}`}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#FFF9F5]"
            >
              <Image
                src={item.image || "/images/product-placeholder.png"}
                alt={item.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <Link href={`/products/${item.slug}`}>
                <h3 className="line-clamp-2 text-sm leading-5 font-semibold text-[#242424] hover:text-[#FF5A5F]">
                  {item.name}
                </h3>
              </Link>

              <p className="mt-1 text-xs text-[#6B7280]">Qty: {item.quantity}</p>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">
                  ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                </span>

                <span className="text-sm font-bold text-[#242424]">
                  ₹{item.subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
