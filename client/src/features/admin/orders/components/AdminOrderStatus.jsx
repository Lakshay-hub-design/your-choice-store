"use client";

import { useState } from "react";

import { CheckCircle2, Loader2, Truck, XCircle } from "lucide-react";

import { toast } from "sonner";

import {
  cancelAdminOrder,
  updateAdminOrderStatus,
  getAvailableCouriers,
  assignCourier,
  schedulePickup,
} from "@/features/admin/orders/services/adminOrderService";

import AdminCancelOrderModal from "./AdminCancelOrderModal";
import CourierSelectionModal from "./CourierSelectionModal";
import SchedulePickupModal from "./SchedulePickupModal";

const NEXT_STATUS = {
  PLACED: "CONFIRMED",
};

const LABELS = {
  CONFIRMED: "Confirm Order",
};

export default function AdminOrderStatus({ order, onUpdated }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const [isCancelling, setIsCancelling] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);

  /*
   * --------------------------------------------------------------------------
   * Courier Selection
   * --------------------------------------------------------------------------
   */

  const [showCourierModal, setShowCourierModal] = useState(false);

  const [couriers, setCouriers] = useState([]);

  const [packageDetails, setPackageDetails] = useState(null);

  const [isLoadingCouriers, setIsLoadingCouriers] = useState(false);

  const [courierFetchError, setCourierFetchError] = useState("");

  const [courierAssignError, setCourierAssignError] = useState("");

  const [selectedCourierId, setSelectedCourierId] = useState(null);

  const [isAssigningCourier, setIsAssigningCourier] = useState(false);

  /*
   * --------------------------------------------------------------------------
   * Pickup Scheduling
   * --------------------------------------------------------------------------
   */

  const [showPickupModal, setShowPickupModal] = useState(false);

  const [isSchedulingPickup, setIsSchedulingPickup] = useState(false);

  const [pickupError, setPickupError] = useState("");

  const nextStatus = NEXT_STATUS[order.orderStatus];

  const canCancel = ["PLACED", "CONFIRMED", "PROCESSING"].includes(order.orderStatus);

  /*
   * --------------------------------------------------------------------------
   * Order Status
   * --------------------------------------------------------------------------
   */

  const handleUpdate = async () => {
    if (!nextStatus) {
      return;
    }

    try {
      setIsUpdating(true);

      const updatedOrder = await updateAdminOrderStatus(order._id, nextStatus);

      onUpdated(updatedOrder);

      toast.success(`Order marked as ${formatStatus(nextStatus)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Open Courier Selection
   * --------------------------------------------------------------------------
   */

  const handleOpenSchedulePickup = async () => {
    setShowCourierModal(true);

    setIsLoadingCouriers(true);

    setCourierFetchError("");
    setCourierAssignError("");

    setCouriers([]);
    setPackageDetails(null);
    setSelectedCourierId(null);

    try {
      const data = await getAvailableCouriers(order._id);

      setCouriers(data?.couriers || []);

      setPackageDetails(data?.package || null);
    } catch (error) {
      setCourierFetchError(error.response?.data?.message || "Unable to load available couriers.");
    } finally {
      setIsLoadingCouriers(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Close Courier Modal
   * --------------------------------------------------------------------------
   */

  const handleCloseCourierModal = () => {
    if (isAssigningCourier) {
      return;
    }

    setShowCourierModal(false);

    setSelectedCourierId(null);

    setCourierFetchError("");
    setCourierAssignError("");
  };

  /*
   * --------------------------------------------------------------------------
   * Assign Courier / AWB
   * --------------------------------------------------------------------------
   */

  const handleAssignCourier = async () => {
    if (!selectedCourierId) {
      return;
    }

    try {
      setIsAssigningCourier(true);

      setCourierAssignError("");

      const data = await assignCourier(order._id, selectedCourierId);

      /*
       * Update parent order with the newly assigned AWB.
       */
      if (data?.order) {
        onUpdated(data.order);
      }

      /*
       * Close courier selection.
       */
      setShowCourierModal(false);

      setSelectedCourierId(null);

      /*
       * Open pickup date modal.
       */
      setPickupError("");

      setShowPickupModal(true);
    } catch (error) {
      setCourierAssignError(error.response?.data?.message || "Unable to assign courier.");
    } finally {
      setIsAssigningCourier(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Schedule Pickup
   * --------------------------------------------------------------------------
   */

  const handleSchedulePickup = async (pickupDate) => {
    try {
      setIsSchedulingPickup(true);

      setPickupError("");

      const data = await schedulePickup(order._id, pickupDate);

      if (data?.order) {
        onUpdated(data.order);
      }

      setShowPickupModal(false);

      toast.success("Pickup scheduled successfully.");
    } catch (error) {
      setPickupError(error.response?.data?.message || "Unable to schedule pickup.");
    } finally {
      setIsSchedulingPickup(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Cancel Order
   * --------------------------------------------------------------------------
   */

  const handleCancel = async (reason) => {
    try {
      setIsCancelling(true);

      const updatedOrder = await cancelAdminOrder(order._id, reason);

      onUpdated(updatedOrder);

      setShowCancelModal(false);

      toast.success("Order cancelled successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to cancel order.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="font-semibold text-[#242424]">Order Status</h2>

        {/* Current Status */}
        <div className="mt-4">
          <p className="mb-1.5 text-xs text-[#9CA3AF]">Current Status</p>

          <OrderStatusBadge status={order.orderStatus} />
        </div>

        {/* Confirm Order */}
        {nextStatus && (
          <div className="mt-5 border-t border-[#F0F0F0] pt-5">
            <p className="text-xs text-[#6B7280]">Next step</p>

            <p className="mt-1 text-sm font-semibold text-[#242424]">{formatStatus(nextStatus)}</p>

            <button
              type="button"
              disabled={isUpdating || isCancelling}
              onClick={handleUpdate}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-4 text-sm font-semibold text-white transition hover:bg-[#f1494e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />

                  {LABELS[nextStatus]}
                </>
              )}
            </button>
          </div>
        )}

        {/* Schedule Pickup */}
        {order.orderStatus === "CONFIRMED" && (
          <div className="mt-5 border-t border-[#F0F0F0] pt-5">
            <p className="text-xs text-[#6B7280]">Next step</p>

            <p className="mt-1 text-sm font-semibold text-[#242424]">Schedule Shipment Pickup</p>

            <button
              type="button"
              disabled={isUpdating || isCancelling || isLoadingCouriers || isAssigningCourier}
              onClick={handleOpenSchedulePickup}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-4 text-sm font-semibold text-white transition hover:bg-[#f1494e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Truck size={16} />
              Schedule Pickup
            </button>
          </div>
        )}

        {/* Processing Information */}
        {order.orderStatus === "PROCESSING" && (
          <div className="mt-5 rounded-xl bg-[#FFF9F5] p-4">
            <p className="text-xs font-semibold text-[#242424]">Shipment in progress</p>

            <p className="mt-1 text-xs leading-5 text-[#6B7280]">
              Courier pickup and shipment tracking are managed through Shiprocket.
            </p>
          </div>
        )}

        {/* Cancel */}
        {canCancel && (
          <button
            type="button"
            disabled={isUpdating || isCancelling || isAssigningCourier || isSchedulingPickup}
            onClick={() => setShowCancelModal(true)}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle size={16} />
            Cancel Order
          </button>
        )}

        {/* Delivered */}
        {order.orderStatus === "DELIVERED" && (
          <p className="mt-4 text-xs leading-5 text-[#6B7280]">
            This order has been delivered and no further fulfillment actions are available.
          </p>
        )}

        {/* Cancelled */}
        {order.orderStatus === "CANCELLED" && (
          <p className="mt-4 text-xs leading-5 text-[#6B7280]">
            This order has been cancelled and cannot be updated.
          </p>
        )}
      </div>

      {/* Cancel Modal */}
      <AdminCancelOrderModal
        open={showCancelModal}
        order={order}
        isCancelling={isCancelling}
        onClose={() => {
          if (!isCancelling) {
            setShowCancelModal(false);
          }
        }}
        onConfirm={handleCancel}
      />

      {/* Courier Selection */}
      <CourierSelectionModal
        isOpen={showCourierModal}
        onClose={handleCloseCourierModal}
        couriers={couriers}
        packageDetails={packageDetails}
        isLoading={isLoadingCouriers}
        fetchError={courierFetchError}
        assignError={courierAssignError}
        selectedCourierId={selectedCourierId}
        onSelectCourier={setSelectedCourierId}
        onAssign={handleAssignCourier}
        isAssigning={isAssigningCourier}
      />

      {/* Pickup Date */}
      <SchedulePickupModal
        isOpen={showPickupModal}
        onClose={() => {
          if (!isSchedulingPickup) {
            setShowPickupModal(false);
            setPickupError("");
          }
        }}
        onSchedule={handleSchedulePickup}
        isSchedulingPickup={isSchedulingPickup}
        error={pickupError}
      />
    </>
  );
}

function OrderStatusBadge({ status }) {
  const styles = {
    PLACED: "bg-blue-50 text-blue-600",

    CONFIRMED: "bg-indigo-50 text-indigo-600",

    PROCESSING: "bg-amber-50 text-amber-600",

    SHIPPED: "bg-purple-50 text-purple-600",

    OUT_FOR_DELIVERY: "bg-orange-50 text-orange-600",

    DELIVERED: "bg-green-50 text-green-600",

    RTO: "bg-red-50 text-red-600",

    CANCELLED: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

function formatStatus(status = "") {
  if (!status) {
    return "—";
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
