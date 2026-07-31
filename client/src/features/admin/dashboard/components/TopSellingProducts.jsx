import Image from "next/image";
import Link from "next/link";

import { ArrowRight, Trophy } from "lucide-react";

export default function TopSellingProducts({ products = [] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-[#F0F0F0] px-5 py-4">
        <div className="flex items-center gap-2">
          <Trophy size={17} className="text-amber-500" />

          <h2 className="font-semibold text-[#242424]">Top Selling Products</h2>
        </div>

        <Link
          href="/admin/products?sort=soldDesc"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF5A5F]"
        >
          View Products
          <ArrowRight size={13} />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center p-6">
          <p className="text-sm text-[#9CA3AF]">No sales data yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#F0F0F0]">
          {products.map((product, index) => (
            <ProductItem key={product._id} product={product} position={index + 1} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProductItem({ product, position }) {
  const image =
    product.images?.[0]?.url ||
    product.images?.[0]?.secure_url ||
    "/images/product-placeholder.png";

  return (
    <Link
      href={`/admin/products/${product._id}/edit`}
      className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#FAFAFA]"
    >
      <span className="w-5 shrink-0 text-center text-xs font-bold text-[#9CA3AF]">#{position}</span>

      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FFF9F5]">
        <Image src={image} alt={product.name} fill sizes="44px" className="object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#242424]">{product.name}</p>

        <p className="mt-0.5 text-xs text-[#9CA3AF]">
          ₹{Number(product.price || 0).toLocaleString("en-IN")}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-[#242424]">{product.sold || 0}</p>

        <p className="text-[10px] text-[#9CA3AF]">sold</p>
      </div>
    </Link>
  );
}
