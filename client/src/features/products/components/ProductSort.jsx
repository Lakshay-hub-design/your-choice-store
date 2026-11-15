"use client";

import useProductFilters from "@/features/products/hooks/useProductFilters";

export default function ProductSort() {
  const { searchParams, updateFilters } = useProductFilters();

  const sort = searchParams.get("sort") || "newest";

  const handleChange = (event) => {
    updateFilters({
      sort: event.target.value,
      page: 1,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-[#6B7280] sm:block">Sort by:</span>

      <select
        value={sort}
        onChange={handleChange}
        className="rounded-xl border border-[#EDE9E6] bg-white px-3 py-2.5 text-xs font-medium text-[#242424] outline-none focus:border-[#FF5A5F]"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="name_asc">Name: A-Z</option>
        <option value="name_desc">Name: Z-A</option>
        <option value="best_selling">Best Selling</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>
  );
}
