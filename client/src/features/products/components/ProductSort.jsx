"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ArrowUpDown } from "lucide-react";

export default function ProductSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "newest";

  const handleSort = (value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    // Sorting can change which products
    // belong on the current page.
    params.delete("page");

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown size={15} className="hidden text-[#6B7280] sm:block" />

      <select
        value={currentSort}
        onChange={(event) => handleSort(event.target.value)}
        className="h-10 rounded-xl border border-[#EDE9E6] bg-white px-3 text-xs font-medium text-[#242424] transition outline-none focus:border-[#FF5A5F]"
      >
        <option value="newest">Newest</option>

        <option value="price_asc">Price: Low to High</option>

        <option value="price_desc">Price: High to Low</option>

        <option value="best_selling">Best Selling</option>

        <option value="rating">Customer Rating</option>
      </select>
    </div>
  );
}
