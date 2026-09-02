"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  PackageCheck,
  RefreshCcw,
  Truck,
  XCircle,
} from "lucide-react";

import ReturnRequestForm from "./ReturnRequestForm";
import ReturnShippingForm from "./ReturnShippingForm";

export default function ReturnSection({ order, onUpdated }) {
  const [returnFormOpen, setReturnFormOpen] = useState(false);
  console.log(order);
  const returnRequest = order?.returnRequest || null;

  const returnStatus = returnRequest?.status || null;
  console.log("RETURN REQUEST:", returnRequest);
  console.log("RETURN STATUS:", returnStatus);
  /*
   * Return can only be initiated after
   * the order has been delivered.
   */

  if (!returnRequest && order?.orderStatus !== "DELIVERED") {
    return null;
  }

  /*
   * ==========================================
   * No return request yet
   * ==========================================
   */

  if (!returnRequest) {
    if (returnFormOpen) {
      return (
        <ReturnRequestForm
          order={order}
          onSuccess={async () => {
            setReturnFormOpen(false);

            await onUpdated?.();
          }}
          onCancel={() => {
            setReturnFormOpen(false);
          }}
        />
      );
    }

    return (
      <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0EA] text-[#FF5A5F]">
              <AlertCircle size={18} />
            </div>

            <div>
              <h2 className="font-bold text-[#242424]">Need help with your order?</h2>

              <p className="mt-1 max-w-xl text-xs leading-5 text-[#6B7280]">
                If your product is damaged, defective, incorrect, missing, or not as described, you
                can report the issue here.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setReturnFormOpen(true)}
          className="mt-5 w-full rounded-xl bg-[#FF5A5F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#f1494e]"
        >
          Report an Issue
        </button>
      </section>
    );
  }

  /*
   * ==========================================
   * Existing return request
   * ==========================================
   */

  return (
    <section className="space-y-4">
      <ReturnStatusCard returnRequest={returnRequest} />

      {returnStatus === "APPROVED" && (
        <ReturnShippingForm
          returnId={returnRequest._id}
          onSuccess={async () => {
            await onUpdated?.();
          }}
        />
      )}

      {returnStatus === "RETURN_IN_TRANSIT" && <ReturnShipmentCard returnRequest={returnRequest} />}
    </section>
  );
}

/*
 * ==========================================
 * Status card
 * ==========================================
 */

function ReturnStatusCard({ returnRequest }) {
  const status = returnRequest.status;

  const config = getStatusConfig(status);

  const Icon = config.icon;

  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.iconBackground} ${config.iconColor}`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold text-[#242424]">Return & Issue</h2>

            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${config.badge}`}>
              {config.label}
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-[#6B7280]">{config.description}</p>

          {returnRequest.returnNumber && (
            <p className="mt-3 text-xs text-[#9CA3AF]">
              Return ID:{" "}
              <span className="font-semibold text-[#242424]">{returnRequest.returnNumber}</span>
            </p>
          )}
        </div>
      </div>

      {returnRequest.adminNote && (
        <div className="mt-5 rounded-xl bg-[#FFF9F5] p-4">
          <p className="text-[10px] font-bold tracking-wide text-[#9CA3AF] uppercase">
            Message from seller
          </p>

          <p className="mt-1 text-xs leading-5 text-[#4B5563]">{returnRequest.adminNote}</p>
        </div>
      )}
    </section>
  );
}

/*
 * ==========================================
 * Shipment information
 * ==========================================
 */

function ReturnShipmentCard({ returnRequest }) {
  const shipping = returnRequest.returnShipping;

  if (!shipping) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Truck size={18} className="text-[#7C5CFC]" />

        <h2 className="font-bold text-[#242424]">Return Shipment</h2>
      </div>

      <div className="mt-5 space-y-3">
        <InfoRow label="Courier" value={shipping.courierName} />

        <InfoRow label="Tracking Number" value={shipping.trackingNumber} />

        <InfoRow label="Shipped On" value={formatDate(shipping.shippedAt)} />
      </div>

      <div className="mt-5 rounded-xl bg-purple-50 p-4">
        <p className="text-xs font-semibold text-purple-700">Return shipped successfully</p>

        <p className="mt-1 text-[11px] leading-5 text-purple-600">
          Your return is on its way to us. We will update the status once the package is received.
        </p>
      </div>
    </section>
  );
}

/*
 * ==========================================
 * Status configuration
 * ==========================================
 */

function getStatusConfig(status) {
  const configs = {
    PENDING: {
      label: "Under Review",
      icon: Clock3,
      iconBackground: "bg-amber-50",
      iconColor: "text-amber-600",
      badge: "bg-amber-50 text-amber-700",
      description: "Your issue has been submitted and is currently being reviewed by our team.",
    },

    UNDER_REVIEW: {
      label: "Under Review",
      icon: Clock3,
      iconBackground: "bg-blue-50",
      iconColor: "text-blue-600",
      badge: "bg-blue-50 text-blue-700",
      description: "Our team is reviewing your return request.",
    },

    APPROVED: {
      label: "Return Approved",
      icon: CheckCircle2,
      iconBackground: "bg-green-50",
      iconColor: "text-green-600",
      badge: "bg-green-50 text-green-700",
      description:
        "Your return has been approved. Please ship the product back using the instructions below.",
    },

    REJECTED: {
      label: "Return Rejected",
      icon: XCircle,
      iconBackground: "bg-red-50",
      iconColor: "text-red-500",
      badge: "bg-red-50 text-red-700",
      description: "Unfortunately, your return request was not approved.",
    },

    RETURN_IN_TRANSIT: {
      label: "Return Shipped",
      icon: Truck,
      iconBackground: "bg-purple-50",
      iconColor: "text-purple-600",
      badge: "bg-purple-50 text-purple-700",
      description: "Your return package is on its way to us.",
    },

    RETURN_RECEIVED: {
      label: "Return Received",
      icon: PackageCheck,
      iconBackground: "bg-indigo-50",
      iconColor: "text-indigo-600",
      badge: "bg-indigo-50 text-indigo-700",
      description: "We have received your returned product and will inspect it shortly.",
    },

    INSPECTED: {
      label: "Return Inspected",
      icon: PackageCheck,
      iconBackground: "bg-cyan-50",
      iconColor: "text-cyan-600",
      badge: "bg-cyan-50 text-cyan-700",
      description:
        "Your returned product has been inspected. Your refund will be processed according to the return decision.",
    },

    REFUND_PROCESSING: {
      label: "Refund Processing",
      icon: RefreshCcw,
      iconBackground: "bg-orange-50",
      iconColor: "text-orange-600",
      badge: "bg-orange-50 text-orange-700",
      description: "Your refund is currently being processed.",
    },

    REFUNDED: {
      label: "Refunded",
      icon: CheckCircle2,
      iconBackground: "bg-green-50",
      iconColor: "text-green-600",
      badge: "bg-green-50 text-green-700",
      description: "Your refund has been processed successfully.",
    },

    COMPLETED: {
      label: "Completed",
      icon: CheckCircle2,
      iconBackground: "bg-gray-100",
      iconColor: "text-gray-600",
      badge: "bg-gray-100 text-gray-700",
      description: "Your return request has been completed.",
    },

    CANCELLED: {
      label: "Cancelled",
      icon: XCircle,
      iconBackground: "bg-gray-100",
      iconColor: "text-gray-500",
      badge: "bg-gray-100 text-gray-600",
      description: "This return request has been cancelled.",
    },
  };

  return (
    configs[status] || {
      label: "Return Request",
      icon: Clock3,
      iconBackground: "bg-gray-100",
      iconColor: "text-gray-600",
      badge: "bg-gray-100 text-gray-600",
      description: "Your return request is being processed.",
    }
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
      <span className="text-xs text-[#6B7280]">{label}</span>

      <span className="text-right text-xs font-semibold text-[#242424]">{value || "—"}</span>
    </div>
  );
}

/*
 * ==========================================
 * Date
 * ==========================================
 */

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
