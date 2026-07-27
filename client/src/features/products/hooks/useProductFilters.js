"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilters = (updates) => {
    // Copy ALL existing URL parameters
    const params = new URLSearchParams(searchParams.toString());

    // Only modify the supplied parameters
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Changing filters should return to page 1
    if (!("page" in updates)) {
      params.delete("page");
    }

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return {
    searchParams,
    updateFilters,
  };
}
