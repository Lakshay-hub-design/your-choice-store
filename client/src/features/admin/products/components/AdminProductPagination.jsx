"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminProductPagination({ pagination, onPageChange }) {
  if (!pagination) {
    return null;
  }

  const currentPage = pagination.page || 1;

  const totalPages = pagination.totalPages || 1;

  const totalProducts = pagination.totalProducts || 0;

  const limit = pagination.limit || 20;

  if (totalProducts === 0) {
    return null;
  }

  const start = (currentPage - 1) * limit + 1;

  const end = Math.min(currentPage * limit, totalProducts);

  const pages = createPages(currentPage, totalPages);

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Results info */}

      <p className="text-xs text-[#6B7280] sm:text-sm">
        Showing <span className="font-semibold text-[#242424]">{start}</span>
        {" - "}
        <span className="font-semibold text-[#242424]">{end}</span>
        {" of "}
        <span className="font-semibold text-[#242424]">{totalProducts}</span> products
      </p>

      {/* Pagination */}

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <PageButton
            disabled={!pagination.hasPrevPage}
            onClick={() => onPageChange(currentPage - 1)}
            ariaLabel="Previous page"
          >
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
              <PageButton
                key={page}
                active={page === currentPage}
                onClick={() => onPageChange(page)}
                ariaLabel={`Page ${page}`}
              >
                {page}
              </PageButton>
            )
          )}

          <PageButton
            disabled={!pagination.hasNextPage}
            onClick={() => onPageChange(currentPage + 1)}
            ariaLabel="Next page"
          >
            <ChevronRight size={16} />
          </PageButton>
        </div>
      )}
    </div>
  );
}

function PageButton({ children, active = false, disabled = false, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
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
    return Array.from(
      {
        length: total,
      },
      (_, index) => index + 1
    );
  }

  if (current <= 3) {
    return [1, 2, 3, 4, "...", total];
  }

  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}
