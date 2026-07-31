"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminOrderPagination({ pagination, onPageChange }) {
  if (!pagination) {
    return null;
  }

  const currentPage = pagination.page || 1;

  const totalPages = pagination.totalPages || 1;

  if (totalPages <= 1) {
    return null;
  }

  const pages = createPages(currentPage, totalPages);

  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      <p className="hidden text-sm text-[#6B7280] sm:block">
        Page <span className="font-semibold text-[#242424]">{currentPage}</span> of{" "}
        <span className="font-semibold text-[#242424]">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <PageButton disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
          <ChevronLeft size={16} />
        </PageButton>

        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`dots-${index}`}
              className="flex h-9 w-7 items-center justify-center text-xs text-[#9CA3AF]"
            >
              ...
            </span>
          ) : (
            <PageButton key={page} active={page === currentPage} onClick={() => onPageChange(page)}>
              {page}
            </PageButton>
          )
        )}

        <PageButton
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight size={16} />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({ children, active, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
        active
          ? "bg-[#FF5A5F] text-white"
          : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#FF5A5F] hover:text-[#FF5A5F]"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function createPages(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, "...", total];
  }

  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}
