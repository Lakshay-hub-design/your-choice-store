"use client";

import { RotateCcw, Search } from "lucide-react";

export default function AdminOrderFilters({ filters, onChange }) {
  const hasFilters =
    filters.search ||
    filters.status ||
    filters.paymentStatus ||
    filters.paymentMethod ||
    filters.sort !== "newest";

  const handleClear = () => {
    onChange({
      search: "",
      status: "",
      paymentStatus: "",
      paymentMethod: "",
      sort: "newest",
    });
  };

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_180px_180px_160px_160px]">
        {/* Search */}

        <div className="relative">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#9CA3AF]" />

          <input
            type="text"
            value={filters.search}
            onChange={(event) =>
              onChange({
                search: event.target.value,
              })
            }
            placeholder="Search order, customer or phone..."
            className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white pr-3 pl-9 text-sm text-[#242424] transition outline-none placeholder:text-[#9CA3AF] focus:border-[#FF5A5F]"
          />
        </div>

        {/* Order Status */}

        <select
          value={filters.status}
          onChange={(event) =>
            onChange({
              status: event.target.value,
            })
          }
          className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#374151] outline-none focus:border-[#FF5A5F]"
        >
          <option value="">All statuses</option>

          <option value="PLACED">Placed</option>

          <option value="CONFIRMED">Confirmed</option>

          <option value="PROCESSING">Processing</option>

          <option value="SHIPPED">Shipped</option>

          <option value="DELIVERED">Delivered</option>

          <option value="CANCELLED">Cancelled</option>
        </select>

        {/* Payment Status */}

        <select
          value={filters.paymentStatus}
          onChange={(event) =>
            onChange({
              paymentStatus: event.target.value,
            })
          }
          className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#374151] outline-none focus:border-[#FF5A5F]"
        >
          <option value="">All payments</option>

          <option value="PENDING">Pending</option>

          <option value="PAID">Paid</option>

          <option value="FAILED">Failed</option>

          <option value="REFUNDED">Refunded</option>
        </select>

        {/* Payment Method */}

        <select
          value={filters.paymentMethod}
          onChange={(event) =>
            onChange({
              paymentMethod: event.target.value,
            })
          }
          className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#374151] outline-none focus:border-[#FF5A5F]"
        >
          <option value="">All methods</option>

          <option value="COD">COD</option>

          <option value="ONLINE">Online</option>
        </select>

        {/* Sort */}

        <select
          value={filters.sort}
          onChange={(event) =>
            onChange({
              sort: event.target.value,
            })
          }
          className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#374151] outline-none focus:border-[#FF5A5F]"
        >
          <option value="newest">Newest</option>

          <option value="oldest">Oldest</option>

          <option value="totalHigh">Total: High to Low</option>

          <option value="totalLow">Total: Low to High</option>
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] transition hover:text-[#FF5A5F]"
        >
          <RotateCcw size={13} />
          Clear filters
        </button>
      )}
    </div>
  );
}
