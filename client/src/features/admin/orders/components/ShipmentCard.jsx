"use client";

import { CheckCircle2, Copy, Package, Truck } from "lucide-react";

import { useState } from "react";

import CourierSelectionModal from "./CourierSelectionModal";
import {
  getAvailableCouriers,
  assignCourier,
} from "@/features/admin/orders/services/adminOrderService";

export default function ShipmentCard({ order, onUpload }) {
  const [copiedField, setCopiedField] = useState("");

  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);

  const [couriers, setCouriers] = useState([]);

  const [packageDetails, setPackageDetails] = useState(null);

  const [isLoadingCouriers, setIsLoadingCouriers] = useState(false);

  const [fetchError, setFetchError] = useState("");
  const [assignError, setAssignError] = useState("");

  const [selectedCourierId, setSelectedCourierId] = useState(null);

  const [isAssigning, setIsAssigning] = useState(false);

  const shipment = order?.shipment;

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
  const isAwbAssigned = Boolean(shipment.awbCode);

  const copyToClipboard = async (value, field) => {
    if (!value) return;

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

  const openCourierModal = async () => {
    setIsCourierModalOpen(true);

    setIsLoadingCouriers(true);

    setFetchError("");
    setAssignError("");

    setCouriers([]);
    setPackageDetails(null);
    setSelectedCourierId(null);

    try {
      const data = await getAvailableCouriers(order._id);

      setCouriers(data?.couriers || []);
      setPackageDetails(data?.package || null);
    } catch (error) {
      setFetchError(error.response?.data?.message || "Unable to load available couriers.");
    } finally {
      setIsLoadingCouriers(false);
    }
  };

  const closeCourierModal = () => {
    if (isAssigning) return;

    setIsCourierModalOpen(false);

    setSelectedCourierId(null);

    setFetchError("");
    setAssignError("");
  };

  const handleAssignCourier = async () => {
    if (!selectedCourierId) {
      return;
    }

    setIsAssigning(true);
    setAssignError("");

    try {
      const data = await assignCourier(order._id, selectedCourierId);

      if (data?.order) {
        onUpdated?.(data.order);
      }

      setIsCourierModalOpen(false);
      setSelectedCourierId(null);
    } catch (error) {
      setAssignError(error.response?.data?.message || "Unable to assign courier.");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <ShipmentHeader />

      {/* Status */}
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
      </div>

      {/* Action */}
      {!isAwbAssigned && (
        <button
          type="button"
          onClick={openCourierModal}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e94d52]"
        >
          <Truck size={16} />
          Assign Courier
        </button>
      )}

      {isAwbAssigned && (
        <button
          type="button"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-[#242424] transition hover:bg-[#FFF9F5]"
        >
          <Truck size={16} />
          Schedule Pickup
        </button>
      )}

      <CourierSelectionModal
        isOpen={isCourierModalOpen}
        onClose={closeCourierModal}
        couriers={couriers}
        packageDetails={packageDetails}
        isLoading={isLoadingCouriers}
        fetchError={fetchError}
        assignError={assignError}
        selectedCourierId={selectedCourierId}
        onSelectCourier={setSelectedCourierId}
        onAssign={handleAssignCourier}
        isAssigning={isAssigning}
      />
    </section>
  );
}

function ShipmentHeader() {
  return (
    <div className="flex items-center gap-2">
      <Package size={17} className="text-[#FF5A5F]" />

      <h2 className="font-semibold text-[#242424]">Shipment</h2>
    </div>
  );
}

function ShipmentStatus({ status }) {
  const styles = {
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

function formatShipmentStatus(status = "") {
  if (!status) return "—";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
