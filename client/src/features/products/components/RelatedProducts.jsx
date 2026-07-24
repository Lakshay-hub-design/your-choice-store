import Link from "next/link";

import ProductCard from "./ProductCard";

export default function RelatedProducts({ products = [] }) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="mt-8">
      {/* Heading */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-[#FF5A5F] uppercase">
            You may also like
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#242424] sm:text-2xl">Related Products</h2>

          <p className="mt-1 text-sm text-[#6B7280]">More products you might love.</p>
        </div>

        <Link
          href="/products"
          className="hidden text-xs font-semibold text-[#7C5CFC] transition hover:text-[#6244e5] sm:block"
        >
          View All →
        </Link>
      </div>

      {/* Products */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      <div className="mt-5 text-center sm:hidden">
        <Link href="/products" className="text-xs font-semibold text-[#7C5CFC]">
          View All Products →
        </Link>
      </div>
    </section>
  );
}
