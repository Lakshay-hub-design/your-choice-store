"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ReviewPagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-8 flex items-center justify-between">
      <p className="text-sm text-[#6B7280]">
        Page <span className="font-semibold text-[#242424]">{pagination.page}</span> of{" "}
        <span className="font-semibold text-[#242424]">{pagination.totalPages}</span>
      </p>

      <div className="flex gap-3">
        <button
          disabled={!pagination.hasPrevPage}
          onClick={() => onPageChange(pagination.page - 1)}
          className="flex h-10 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <button
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
          className="flex h-10 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium disabled:opacity-50"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
