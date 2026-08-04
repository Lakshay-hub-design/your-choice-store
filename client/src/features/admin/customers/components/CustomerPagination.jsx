"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomerPagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages, hasNextPage, hasPrevPage } = pagination;

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-[#6B7280]">
        Page <span className="font-semibold text-[#242424]">{page}</span> of{" "}
        <span className="font-semibold text-[#242424]">{totalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          disabled={!hasPrevPage}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium hover:bg-[#F8F9FB] disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <button
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium hover:bg-[#F8F9FB] disabled:opacity-50"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
