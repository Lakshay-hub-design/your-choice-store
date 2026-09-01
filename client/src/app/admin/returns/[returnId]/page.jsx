"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Mail,
  Package,
  Phone,
  User,
  XCircle,
} from "lucide-react";

import {
  getReturnRequestById,
  approveReturnRequest,
  rejectReturnRequest,
} from "@/features/returns/services/adminReturnService";

const statusStyles = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",

  UNDER_REVIEW: "border-blue-200 bg-blue-50 text-blue-700",

  APPROVED: "border-green-200 bg-green-50 text-green-700",

  REJECTED: "border-red-200 bg-red-50 text-red-700",

  RETURN_IN_TRANSIT: "border-purple-200 bg-purple-50 text-purple-700",

  RETURN_RECEIVED: "border-indigo-200 bg-indigo-50 text-indigo-700",

  INSPECTED: "border-cyan-200 bg-cyan-50 text-cyan-700",

  REFUND_PROCESSING: "border-orange-200 bg-orange-50 text-orange-700",

  REFUNDED: "border-green-200 bg-green-50 text-green-700",

  COMPLETED: "border-gray-200 bg-gray-100 text-gray-700",

  CANCELLED: "border-gray-200 bg-gray-100 text-gray-500",
};

export default function ReturnDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const returnId = params?.returnId;

  const [returnRequest, setReturnRequest] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!returnId) return;

    const loadReturn = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getReturnRequestById(returnId);

        setReturnRequest(data);
      } catch (error) {
        console.error("Failed to load return request:", error);

        setError(error?.response?.data?.message || "Unable to load return request.");
      } finally {
        setLoading(false);
      }
    };

    loadReturn();
  }, [returnId]);

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <Loader2 size={18} className="animate-spin" />
          Loading return request...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <Link
          href="/admin/returns"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#FF5A5F]"
        >
          <ArrowLeft size={16} />
          Back to Returns
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!returnRequest) {
    return null;
  }

  const canReview = returnRequest.status === "PENDING" || returnRequest.status === "UNDER_REVIEW";

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4">
        <Link
          href="/admin/returns"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#6B7280] transition hover:text-[#FF5A5F]"
        >
          <ArrowLeft size={16} />
          Back to Returns
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-[#242424]">{returnRequest.returnNumber}</h1>

              <StatusBadge status={returnRequest.status} />
            </div>

            <p className="mt-2 text-sm text-[#6B7280]">
              Return request for order{" "}
              <span className="font-semibold text-[#242424]">
                #{returnRequest.order?.orderNumber || "—"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <CalendarDays size={15} />

            {formatDateTime(returnRequest.createdAt)}
          </div>
        </div>
      </div>

      {/* Review Actions */}

      {canReview && (
        <div className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-6">
          <div>
            <h2 className="font-bold text-[#242424]">Review this request</h2>

            <p className="mt-1 text-xs leading-5 text-[#6B7280]">
              Check the customer's reason and evidence before approving or rejecting the request.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 opacity-60"
            >
              <XCircle size={17} />
              Reject Return
            </button>

            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white opacity-60"
            >
              <CheckCircle2 size={17} />
              Approve Return
            </button>
          </div>

          <p className="mt-3 text-right text-[11px] text-[#9CA3AF]">
            Approval and rejection will be enabled in the next step.
          </p>
        </div>
      )}

      {/* Main grid */}

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* Left */}

        <div className="space-y-5">
          <ReturnItems items={returnRequest.items} />

          <IssueDetails reason={returnRequest.reason} description={returnRequest.description} />

          <Evidence images={returnRequest.images} />
        </div>

        {/* Right */}

        <div className="space-y-5">
          <CustomerCard user={returnRequest.user} />

          <OrderCard order={returnRequest.order} />

          <ReturnInformation returnRequest={returnRequest} />
        </div>
      </div>
    </div>
  );
}

/*
 * ==========================================
 * Returned items
 * ==========================================
 */

function ReturnItems({ items = [] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white">
      <div className="border-b border-[#EDE9E6] px-5 py-4">
        <h2 className="font-bold text-[#242424]">Returned Items</h2>
      </div>

      <div className="divide-y divide-[#F1EEEB]">
        {items.map((item, index) => (
          <div key={`${item.product}-${index}`} className="flex gap-4 p-5">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#FFF9F5]">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#9CA3AF]">
                  <Package size={22} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-[#242424]">{item.name}</h3>

              <p className="mt-1 text-xs text-[#6B7280]">SKU: {item.sku || "—"}</p>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#6B7280]">
                <span>
                  Quantity: <strong className="text-[#242424]">{item.quantity}</strong>
                </span>

                <span>
                  Price:{" "}
                  <strong className="text-[#242424]">
                    ₹{Number(item.price || 0).toLocaleString("en-IN")}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/*
 * ==========================================
 * Issue details
 * ==========================================
 */

function IssueDetails({ reason, description }) {
  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5">
      <h2 className="font-bold text-[#242424]">Customer Issue</h2>

      <div className="mt-5">
        <p className="text-xs font-semibold tracking-wide text-[#9CA3AF] uppercase">Reason</p>

        <p className="mt-1 text-sm font-semibold text-[#242424]">{formatReason(reason)}</p>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold tracking-wide text-[#9CA3AF] uppercase">Description</p>

        <div className="mt-2 rounded-xl bg-[#FFF9F5] p-4">
          <p className="text-sm leading-6 whitespace-pre-wrap text-[#4B5563]">{description}</p>
        </div>
      </div>
    </section>
  );
}

/*
 * ==========================================
 * Evidence
 * ==========================================
 */

function Evidence({ images = [] }) {
  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5">
      <div className="flex items-center gap-2">
        <ImageIcon size={18} className="text-[#FF5A5F]" />

        <h2 className="font-bold text-[#242424]">Customer Evidence</h2>
      </div>

      {images.length === 0 ? (
        <div className="mt-5 rounded-xl bg-[#FFF9F5] p-5 text-center">
          <p className="text-sm text-[#6B7280]">No photos were uploaded.</p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <a
              key={image.fileId || `${image.url}-${index}`}
              href={image.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl border border-[#EDE9E6] bg-[#FFF9F5]"
            >
              <img
                src={image.url}
                alt={`Customer evidence ${index + 1}`}
                className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
              />

              <div className="absolute inset-x-0 bottom-0 bg-black/50 px-3 py-2 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                Open image
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

/*
 * ==========================================
 * Customer
 * ==========================================
 */

function CustomerCard({ user }) {
  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5">
      <h2 className="font-bold text-[#242424]">Customer</h2>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF0EA] text-[#FF5A5F]">
          <User size={19} />
        </div>

        <div>
          <p className="text-sm font-bold text-[#242424]">{user?.fullName || "Unknown customer"}</p>

          <p className="mt-0.5 text-xs text-[#6B7280]">Customer</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <ContactRow icon={Mail} value={user?.email} />

        <ContactRow icon={Phone} value={user?.phone} />
      </div>
    </section>
  );
}

/*
 * ==========================================
 * Order
 * ==========================================
 */

function OrderCard({ order }) {
  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5">
      <h2 className="font-bold text-[#242424]">Order</h2>

      <div className="mt-5 space-y-3">
        <InfoRow label="Order Number" value={order?.orderNumber ? `#${order.orderNumber}` : "—"} />

        <InfoRow label="Order Status" value={formatStatus(order?.orderStatus)} />

        <InfoRow label="Payment Method" value={order?.paymentMethod || "—"} />

        <InfoRow label="Payment Status" value={order?.paymentStatus || "—"} />

        <InfoRow label="Order Date" value={formatDate(order?.createdAt)} />
      </div>
    </section>
  );
}

/*
 * ==========================================
 * Return information
 * ==========================================
 */

function ReturnInformation({ returnRequest }) {
  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5">
      <h2 className="font-bold text-[#242424]">Return Information</h2>

      <div className="mt-5 space-y-3">
        <InfoRow label="Return ID" value={returnRequest.returnNumber} />

        <InfoRow label="Status" value={formatStatus(returnRequest.status)} />

        <InfoRow
          label="Resolution"
          value={returnRequest.resolution ? formatStatus(returnRequest.resolution) : "Not decided"}
        />

        <InfoRow
          label="Refund"
          value={
            returnRequest.refund?.status ? formatStatus(returnRequest.refund.status) : "Not started"
          }
        />
      </div>
    </section>
  );
}

/*
 * ==========================================
 * Contact row
 * ==========================================
 */

function ContactRow({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={15} className="shrink-0 text-[#9CA3AF]" />

      <span className="min-w-0 truncate text-xs text-[#6B7280]">{value || "Not provided"}</span>
    </div>
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

      <span className="text-right text-xs font-semibold text-[#242424]">{value || "—"}</span>
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
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold ${
        statusStyles[status] || "border-gray-200 bg-gray-50 text-gray-600"
      }`}
    >
      {formatStatus(status)}
    </span>
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

  return labels[reason] || reason || "—";
}

function formatStatus(status) {
  if (!status) return "—";

  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

                )
              : "Not decided"
          }
        />

        <InfoRow
          label="Refund"
          value={
            returnRequest.refund?.status
              ? formatStatus(
                  returnRequest.refund
                    .status
                )
              : "Not started"
          }
        />
      </div>
    </section>
  );
}

/*
 * ==========================================
 * Contact row
 * ==========================================
 */

function ContactRow({
  icon: Icon,
  value,
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon
        size={15}
        className="shrink-0 text-[#9CA3AF]"
      />

      <span className="min-w-0 truncate text-xs text-[#6B7280]">
        {value || "Not provided"}
      </span>
    </div>
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
      <span className="text-xs text-[#9CA3AF]">
        {label}
      </span>

      <span className="text-right text-xs font-semibold text-[#242424]">
        {value || "—"}
      </span>
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
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold ${
        statusStyles[status] ||
        "border-gray-200 bg-gray-50 text-gray-600"
      }`}
    >
      {formatStatus(status)}
    </span>
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
    NOT_AS_DESCRIBED:
      "Not as Described",
    OTHER: "Other",
  };

  return labels[reason] || reason || "—";
}

function formatStatus(status) {
  if (!status) return "—";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatDateTime(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}