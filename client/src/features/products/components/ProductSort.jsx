"use client";

import useProductFilters from "@/features/products/hooks/useProductFilters";

export default function ProductSort() {
  const { searchParams, updateFilters } = useProductFilters();

  const sort = searchParams.get("sort") || "newest";

  const handleChange = (event) => {
    updateFilters({
      sort: event.target.value,
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

        <option value="priceAsc">Price: Low to High</option>

        <option value="priceDesc">Price: High to Low</option>

        <option value="nameAsc">Name: A-Z</option>

        <option value="nameDesc">Name: Z-A</option>
      </select>
    </div>
  );
}
