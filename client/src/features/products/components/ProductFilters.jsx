"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { RotateCcw, SlidersHorizontal } from "lucide-react";

export default function ProductFilters({ categories = [], onFilterApplied }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get("category") || "";

  const urlMinPrice = searchParams.get("minPrice") || "";

  const urlMaxPrice = searchParams.get("maxPrice") || "";

  const inStock = searchParams.get("inStock") === "true";

  /*
   * Local price inputs
   */
  const [minPrice, setMinPrice] = useState(urlMinPrice);

  const [maxPrice, setMaxPrice] = useState(urlMaxPrice);

  /*
   * Keep local price fields synchronized
   * with browser back/forward navigation.
   */
  useEffect(() => {
    setMinPrice(urlMinPrice);
    setMaxPrice(urlMaxPrice);
  }, [urlMinPrice, urlMaxPrice]);

  /*
   * Update one filter while preserving
   * every other existing query parameter.
   */
  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "" || value === null || value === false) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }

    /*
     * Filters changed, so return
     * to the first page.
     */
    params.delete("page");

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);

    onFilterApplied?.();
  };

  /*
   * Update multiple filters together.
   * Useful for min/max price.
   */
  const updateFilters = (updates) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    params.delete("page");

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);

    onFilterApplied?.();
  };

  /*
   * Apply price
   */
  const handlePriceApply = () => {
    updateFilters({
      minPrice,
      maxPrice,
    });
  };

  /*
   * Clear sidebar filters while keeping
   * things like search and sort.
   */
  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("category");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("inStock");
    params.delete("page");

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);

    setMinPrice("");
    setMaxPrice("");

    onFilterApplied?.();
  };

  return (
    <div className="rounded-2xl border border-[#EDE9E6] bg-white p-5">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-[#EDE9E6] pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={17} className="text-[#FF5A5F]" />

          <h2 className="font-semibold text-[#242424]">Filters</h2>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="flex items-center gap-1 text-[10px] font-medium text-[#6B7280] transition hover:text-[#FF5A5F]"
        >
          <RotateCcw size={11} />
          Clear
        </button>
      </div>

      {/* Categories */}

      <FilterSection title="Categories">
        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="radio"
            name="category"
            checked={!selectedCategory}
            onChange={() => updateFilter("category", "")}
            className="accent-[#FF5A5F]"
          />

          <span className="text-sm text-[#6B7280]">All Categories</span>
        </label>

        {categories.map((category) => (
          <label key={category._id} className="flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === category._id}
              onChange={() => updateFilter("category", category._id)}
              className="accent-[#FF5A5F]"
            />

            <span className="text-sm text-[#6B7280]">{category.name}</span>
          </label>
        ))}
      </FilterSection>

      {/* Price */}

      <FilterSection title="Price Range">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[10px] text-[#9CA3AF]">Min</label>

            <input
              type="number"
              min="0"
              placeholder="₹0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="w-full rounded-lg border border-[#EDE9E6] px-2.5 py-2 text-xs outline-none focus:border-[#FF5A5F]"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] text-[#9CA3AF]">Max</label>

            <input
              type="number"
              min="0"
              placeholder="₹5000"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="w-full rounded-lg border border-[#EDE9E6] px-2.5 py-2 text-xs outline-none focus:border-[#FF5A5F]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handlePriceApply}
          className="mt-3 w-full rounded-lg bg-[#242424] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#FF5A5F]"
        >
          Apply Price
        </button>
      </FilterSection>

      {/* Availability */}

      <FilterSection title="Availability">
        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) => updateFilter("inStock", event.target.checked ? "true" : "")}
            className="accent-[#FF5A5F]"
          />

          <span className="text-sm text-[#6B7280]">In Stock Only</span>
        </label>
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="border-b border-[#EDE9E6] py-5 last:border-0 last:pb-0">
      <h3 className="mb-3 text-xs font-semibold text-[#242424]">{title}</h3>

      <div className="space-y-3">{children}</div>
    </div>
  );
}
