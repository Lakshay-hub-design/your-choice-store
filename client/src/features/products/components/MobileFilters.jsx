"use client";

import { useState } from "react";

import { SlidersHorizontal, X } from "lucide-react";

import ProductFilters from "./ProductFilters";

export default function MobileFilters({ categories }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 items-center gap-2 rounded-xl border border-[#EDE9E6] bg-white px-4 text-xs font-semibold text-[#242424]"
      >
        <SlidersHorizontal size={15} />
        Filters
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[#FFF9F5] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between px-1">
              <div>
                <h2 className="font-bold text-[#242424]">Filters</h2>

                <p className="mt-0.5 text-[10px] text-[#6B7280]">Refine your products</p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white"
              >
                <X size={18} />
              </button>
            </div>

            <ProductFilters categories={categories} onFilterApplied={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
