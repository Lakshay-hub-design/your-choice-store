import Image from "next/image";
import Link from "next/link";

import { AlertTriangle, ArrowRight, PackageX } from "lucide-react";

export default function InventoryAlerts({ products = [] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
      {/* Header */}

      <div className="flex items-center justify-between gap-4 border-b border-[#F0F0F0] px-5 py-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={17} className="text-amber-500" />

          <h2 className="font-semibold text-[#242424]">Inventory Alerts</h2>
        </div>

        <Link
          href="/admin/products?stock=low"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF5A5F]"
        >
          Products
          <ArrowRight size={13} />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-[250px] items-center justify-center p-6 text-center">
          <div>
            <PackageX size={27} className="mx-auto text-[#D1D5DB]" />

            <p className="mt-3 text-sm font-medium text-[#6B7280]">Inventory looks good</p>

            <p className="mt-1 text-xs text-[#9CA3AF]">No products need attention.</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[#F0F0F0]">
          {products.map((product) => (
            <InventoryItem key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

function InventoryItem({ product }) {
  const image =
    product.images?.[0]?.url ||
    product.images?.[0]?.secure_url ||
    "/images/product-placeholder.png";

  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/admin/products/${product._id}/edit`}
      className="flex items-center gap-3 px-5 py-4 transition hover:bg-[#FAFAFA]"
    >
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FFF9F5]">
        <Image src={image} alt={product.name} fill sizes="44px" className="object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#242424]">{product.name}</p>

        <p className="mt-0.5 text-[11px] text-[#9CA3AF]">SKU: {product.sku}</p>
      </div>

      <div className="shrink-0 text-right">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            outOfStock ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
          }`}
        >
          {outOfStock ? "Out of stock" : `${product.stock} left`}
        </span>

        {!outOfStock && (
          <p className="mt-1 text-[10px] text-[#9CA3AF]">Alert at {product.lowStockThreshold}</p>
        )}
      </div>
    </Link>
  );
}
