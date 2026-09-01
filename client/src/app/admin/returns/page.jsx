"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ChevronLeft, ChevronRight, Eye, Loader2, RefreshCw } from "lucide-react";

import { getReturnRequests } from "@/features/returns/services/adminReturnService";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "In Transit", value: "RETURN_IN_TRANSIT" },
  { label: "Received", value: "RETURN_RECEIVED" },
  { label: "Inspected", value: "INSPECTED" },
  { label: "Refunded", value: "REFUNDED" },
];

const statusStyles = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",

  UNDER_REVIEW: "bg-blue-50 text-blue-700 border-blue-200",

  APPROVED: "bg-green-50 text-green-700 border-green-200",

  REJECTED: "bg-red-50 text-red-700 border-red-200",

  RETURN_IN_TRANSIT: "bg-purple-50 text-purple-700 border-purple-200",

  RETURN_RECEIVED: "bg-indigo-50 text-indigo-700 border-indigo-200",

  INSPECTED: "bg-cyan-50 text-cyan-700 border-cyan-200",

  REFUND_PROCESSING: "bg-orange-50 text-orange-700 border-orange-200",

  REFUNDED: "bg-green-50 text-green-700 border-green-200",

  COMPLETED: "bg-gray-100 text-gray-700 border-gray-200",

  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState([]);

  const [pagination, setPagination] = useState(null);

  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadReturns = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getReturnRequests({
        page,
        limit: 10,
        status,
      });

      setReturns(data.returns || []);

      setPagination(data.pagination || null);
    } catch (error) {
      console.error("Failed to load returns:", error);

      setError(error?.response?.data?.message || "Unable to load return requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, [page, status]);

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#242424]">Returns & Issues</h1>

          <p className="mt-1 text-sm text-[#6B7280]">Review customer return and issue requests.</p>
        </div>

        <button
          type="button"
          onClick={loadReturns}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#EDE9E6] bg-white px-4 py-2.5 text-sm font-semibold text-[#242424] transition hover:border-[#FF5A5F]/40 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}

      <div className="overflow-x-auto rounded-2xl border border-[#EDE9E6] bg-white p-2">
        <div className="flex min-w-max gap-1">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => handleStatusChange(filter.value)}
              className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                status === filter.value
                  ? "bg-[#FF5A5F] text-white"
                  : "text-[#6B7280] hover:bg-[#FFF9F5] hover:text-[#242424]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />

          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading */}

      {loading && (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[#EDE9E6] bg-white">
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Loader2 size={18} className="animate-spin" />
            Loading return requests...
          </div>
        </div>
      )}

      {/* Empty */}

      {!loading && !error && returns.length === 0 && (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#EDE9E6] bg-white px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF9F5] text-[#FF5A5F]">
            <AlertCircle size={22} />
          </div>

          <h2 className="mt-4 font-bold text-[#242424]">No return requests</h2>

          <p className="mt-1 max-w-sm text-sm text-[#6B7280]">
            There are no return or issue requests matching this filter.
          </p>
        </div>
      )}

      {/* Desktop table */}

      {!loading && returns.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-[#EDE9E6] bg-[#FFF9F5]">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-bold text-[#6B7280]">Return</th>

                    <th className="px-5 py-4 text-left text-xs font-bold text-[#6B7280]">Order</th>

                    <th className="px-5 py-4 text-left text-xs font-bold text-[#6B7280]">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold text-[#6B7280]">Reason</th>

                    <th className="px-5 py-4 text-left text-xs font-bold text-[#6B7280]">Status</th>

                    <th className="px-5 py-4 text-right text-xs font-bold text-[#6B7280]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {returns.map((returnRequest) => (
                    <ReturnTableRow key={returnRequest._id} returnRequest={returnRequest} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/tablet cards */}

          <div className="space-y-3 lg:hidden">
            {returns.map((returnRequest) => (
              <ReturnCard key={returnRequest._id} returnRequest={returnRequest} />
            ))}
          </div>

          {/* Pagination */}

          {pagination && (
            <Pagination
              pagination={pagination}
              onPrevious={() => setPage((current) => Math.max(current - 1, 1))}
              onNext={() => setPage((current) => current + 1)}
            />
          )}
        </>
      )}
    </div>
  );
}

/*
 * ==========================================
 * Desktop row
 * ==========================================
 */

function ReturnTableRow({ returnRequest }) {
  const orderNumber = returnRequest.order?.orderNumber || "—";

  const customerName = returnRequest.user?.fullName || "Unknown customer";

  return (
    <tr className="border-b border-[#F1EEEB] last:border-0">
      <td className="px-5 py-4">
        <p className="text-sm font-bold text-[#242424]">{returnRequest.returnNumber}</p>

        <p className="mt-1 text-xs text-[#9CA3AF]">{formatDate(returnRequest.createdAt)}</p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[#242424]">#{orderNumber}</p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[#242424]">{customerName}</p>

        <p className="mt-1 text-xs text-[#6B7280]">{returnRequest.user?.email || "—"}</p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-[#242424]">{formatReason(returnRequest.reason)}</p>
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={returnRequest.status} />
      </td>

      <td className="px-5 py-4 text-right">
        <Link
          href={`/admin/returns/${returnRequest._id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-[#EDE9E6] px-3 py-2 text-xs font-semibold text-[#242424] transition hover:border-[#FF5A5F]/40 hover:text-[#FF5A5F]"
        >
          <Eye size={15} />
          View
        </Link>
      </td>
    </tr>
  );
}

/*
 * ==========================================
 * Mobile card
 * ==========================================
 */

function ReturnCard({ returnRequest }) {
  return (
    <div className="rounded-2xl border border-[#EDE9E6] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#242424]">{returnRequest.returnNumber}</p>

          <p className="mt-1 text-xs text-[#9CA3AF]">{formatDate(returnRequest.createdAt)}</p>
        </div>

        <StatusBadge status={returnRequest.status} />
      </div>

      <div className="mt-5 space-y-3">
        <InfoRow
          label="Order"
          value={returnRequest.order?.orderNumber ? `#${returnRequest.order.orderNumber}` : "—"}
        />

        <InfoRow label="Customer" value={returnRequest.user?.fullName || "—"} />

        <InfoRow label="Reason" value={formatReason(returnRequest.reason)} />
      </div>

      <Link
        href={`/admin/returns/${returnRequest._id}`}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#f1494e]"
      >
        <Eye size={15} />
        View Request
      </Link>
    </div>
  );
}

/*
 * ==========================================
 * Status badge
 * ==========================================
 */

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        statusStyles[status] || "border-gray-200 bg-gray-50 text-gray-600"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

/*
 * ==========================================
 * Info row
 * ==========================================
 */

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-[#9CA3AF]">{label}</span>

      <span className="text-right text-xs font-semibold text-[#242424]">{value}</span>
    </div>
  );
}

/*
 * ==========================================
 * Pagination
 * ==========================================
 */

function Pagination({ pagination, onPrevious, onNext }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#EDE9E6] bg-white px-4 py-3">
      <p className="text-xs text-[#6B7280]">
        Page {pagination.page} of {pagination.totalPages || 1}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!pagination.hasPreviousPage}
          onClick={onPrevious}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#EDE9E6] text-[#6B7280] transition hover:border-[#FF5A5F]/40 hover:text-[#FF5A5F] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          type="button"
          disabled={!pagination.hasNextPage}
          onClick={onNext}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#EDE9E6] text-[#6B7280] transition hover:border-[#FF5A5F]/40 hover:text-[#FF5A5F] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/*
 * ==========================================
 * Helpers
 * ==========================================
 */

function formatReason(reason) {
  const labels = {
    DAMAGED: "Damaged",
    WRONG_PRODUCT: "Wrong Product",
    DEFECTIVE: "Defective",
    MISSING_ITEM: "Missing Item",
    NOT_AS_DESCRIBED: "Not as Described",
    OTHER: "Other",
  };

  return labels[reason] || reason;
}

function formatStatus(status) {
  return status?.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
