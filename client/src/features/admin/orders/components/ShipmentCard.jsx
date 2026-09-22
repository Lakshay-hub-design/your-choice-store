"use client";

import { useState } from "react";

import { CheckCircle2, Copy, ExternalLink, Package } from "lucide-react";

export default function ShipmentCard({ order }) {
  const [copiedField, setCopiedField] = useState("");

  const shipment = order?.shipment;

  /*
   * --------------------------------------------------------------------------
   * No shipment
   * --------------------------------------------------------------------------
   */

  if (!shipment) {
    return (
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <ShipmentHeader />

        <div className="mt-5 rounded-xl bg-[#FFF9F5] p-4 text-center">
          <Package size={22} className="mx-auto text-[#D1D5DB]" />

          <p className="mt-2 text-sm font-medium text-[#6B7280]">
            Shipment has not been created yet.
          </p>
        </div>
      </section>
    );
  }

  const status = shipment.currentStatus || "—";

  /*
   * --------------------------------------------------------------------------
   * Clipboard
   * --------------------------------------------------------------------------
   */

  const copyToClipboard = async (value, field) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(String(value));

      setCopiedField(field);

      setTimeout(() => {
        setCopiedField("");
      }, 1500);
    } catch {
      // Ignore clipboard errors.
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Render
   * --------------------------------------------------------------------------
   */

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <ShipmentHeader />

      {/* Shipment Status */}
      <div className="mt-4">
        <ShipmentStatus status={status} />
      </div>

      {/* Shipment Information */}
      <div className="mt-5 space-y-3">
        <ShipmentInfoRow
          label="Shiprocket Order"
          value={shipment.shiprocketOrderId}
          copyable
          copied={copiedField === "shiprocketOrderId"}
          onCopy={() => copyToClipboard(shipment.shiprocketOrderId, "shiprocketOrderId")}
        />

        <ShipmentInfoRow
          label="Shipment ID"
          value={shipment.shipmentId}
          copyable
          copied={copiedField === "shipmentId"}
          onCopy={() => copyToClipboard(shipment.shipmentId, "shipmentId")}
        />

        <ShipmentInfoRow label="Courier" value={shipment.courierName} />

        <ShipmentInfoRow
          label="AWB"
          value={shipment.awbCode}
          copyable={Boolean(shipment.awbCode)}
          copied={copiedField === "awbCode"}
          onCopy={() => copyToClipboard(shipment.awbCode, "awbCode")}
        />

        <ShipmentInfoRow
          label="Pickup Scheduled"
          value={shipment.pickupScheduledAt ? formatDateTime(shipment.pickupScheduledAt) : null}
        />

        <ShipmentInfoRow
          label="Estimated Delivery"
          value={shipment.estimatedDeliveryAt ? formatDateTime(shipment.estimatedDeliveryAt) : null}
        />

        <ShipmentInfoRow
          label="Last Updated"
          value={shipment.lastTrackedAt ? formatDateTime(shipment.lastTrackedAt) : null}
        />
      </div>

      {/* External Tracking */}
      {shipment.trackingUrl && (
        <a
          href={shipment.trackingUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFF9F5] px-4 py-2.5 text-sm font-semibold text-[#FF5A5F] transition hover:bg-[#FFF0F0]"
        >
          <ExternalLink size={15} />
          Track Shipment
        </a>
      )}
    </section>
  );
}

/*
 * ----------------------------------------------------------------------------
 * Header
 * ----------------------------------------------------------------------------
 */

function ShipmentHeader() {
  return (
    <div className="flex items-center gap-2">
      <Package size={17} className="text-[#FF5A5F]" />

      <h2 className="font-semibold text-[#242424]">Shipment</h2>
    </div>
  );
}

/*
 * ----------------------------------------------------------------------------
 * Shipment Status
 * ----------------------------------------------------------------------------
 */

function ShipmentStatus({ status }) {
  const styles = {
    CREATING: "bg-gray-100 text-gray-600",

    CREATED: "bg-blue-50 text-blue-600",

    AWB_ASSIGNED: "bg-indigo-50 text-indigo-600",

    PICKUP_SCHEDULED: "bg-amber-50 text-amber-600",

    PICKED_UP: "bg-purple-50 text-purple-600",

    SHIPPED: "bg-purple-50 text-purple-600",

    IN_TRANSIT: "bg-orange-50 text-orange-600",

    OUT_FOR_DELIVERY: "bg-yellow-50 text-yellow-600",

    DELIVERED: "bg-green-50 text-green-600",

    RTO: "bg-red-50 text-red-600",

    FAILED: "bg-red-50 text-red-600",
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-[#9CA3AF]">Shipment Status</span>

      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
          styles[status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {status === "DELIVERED" && <CheckCircle2 size={13} />}

        {formatShipmentStatus(status)}
      </span>
    </div>
  );
}

/*
 * ----------------------------------------------------------------------------
 * Information Row
 * ----------------------------------------------------------------------------
 */

function ShipmentInfoRow({ label, value, copyable = false, copied = false, onCopy }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-[#9CA3AF]">{label}</span>

      <div className="flex min-w-0 items-center gap-2">
        <span className="max-w-[180px] truncate text-right font-medium text-[#242424]">
          {value || "—"}
        </span>

        {copyable && value && (
          <button
            type="button"
            onClick={onCopy}
            title={copied ? "Copied" : "Copy"}
            className="shrink-0 rounded-md p-1.5 text-[#9CA3AF] transition hover:bg-[#FFF9F5] hover:text-[#FF5A5F]"
          >
            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

/*
 * ----------------------------------------------------------------------------
 * Formatters
 * ----------------------------------------------------------------------------
 */

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShipmentStatus(status = "") {
  if (!status) {
    return "—";
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
