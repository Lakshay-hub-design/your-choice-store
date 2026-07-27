"use client";

import { useEffect, useState } from "react";

import ProductCard from "@/features/products/components/ProductCard";
import useRecentlyViewedStore from "@/store/recentlyViewedStore";

export default function RecentlyViewedProducts({ excludeProductId }) {
  const [mounted, setMounted] = useState(false);

  const products = useRecentlyViewedStore((state) => state.products);

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Avoid hydration differences because
   * localStorage only exists in browser.
   */
  if (!mounted) {
    return null;
  }

  const visibleProducts = products
    .filter((product) => product._id !== excludeProductId)
    .slice(0, 5);

  if (visibleProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[#242424] sm:text-2xl">Recently Viewed</h2>

        <p className="mt-1 text-sm text-[#6B7280]">Pick up where you left off.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {visibleProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
