"use client";

import { AlertCircle, Check, Clock3, LoaderCircle, Package, Star, Truck, X } from "lucide-react";

export default function CourierSelectionModal({
  isOpen,
  onClose,
  couriers = [],
  packageDetails,
  isLoading,
  fetchError,
  assignError,
  selectedCourierId,
  onSelectCourier,
  onAssign,
  isAssigning,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="flex max-h-[74vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-[#242424]">Select Courier</h2>

            <p className="mt-1 text-xs text-[#9CA3AF]">
              Choose a courier to assign an AWB for this shipment.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isAssigning}
            className="rounded-lg p-2 text-[#9CA3AF] transition hover:bg-[#FFF9F5] hover:text-[#242424] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Package */}
        {packageDetails && (
          <div className="border-b border-[#F0F0F0] bg-[#FFF9F5] px-5 py-4">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-[#FF5A5F]" />

              <p className="text-sm font-semibold text-[#242424]">Package</p>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B7280]">
              <span>
                Weight: <strong className="text-[#242424]">{packageDetails.weight} kg</strong>
              </span>

              <span>
                Dimensions:{" "}
                <strong className="text-[#242424]">
                  {packageDetails.length} × {packageDetails.breadth} × {packageDetails.height} cm
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {/* Courier fetching error */}
          {!isLoading && fetchError && (
            <CourierError title="Unable to load couriers" message={fetchError} />
          )}

          {/* Assignment error */}
          {!isLoading && !fetchError && assignError && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-700">Unable to assign courier</p>

                  <p className="mt-1 text-xs leading-5 text-red-600">{assignError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && <CourierLoading />}

          {/* Empty */}
          {!isLoading && !fetchError && couriers.length === 0 && <EmptyCouriers />}

          {/* Courier list */}
          {!isLoading && !fetchError && couriers.length > 0 && (
            <div className="space-y-3">
              {couriers.map((courier) => (
                <CourierCard
                  key={courier.courierId}
                  courier={courier}
                  selected={selectedCourierId === courier.courierId}
                  disabled={isAssigning}
                  onSelect={() => onSelectCourier(courier.courierId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] bg-white px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isAssigning}
            className="rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#242424] transition hover:bg-[#FFF9F5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onAssign}
            disabled={!selectedCourierId || isAssigning || isLoading || Boolean(fetchError)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e94d52] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAssigning ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Assigning...
              </>
            ) : assignError ? (
              <>
                <Truck size={16} />
                Try Again
              </>
            ) : (
              <>
                <Truck size={16} />
                Assign Courier
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CourierCard({ courier, selected, disabled, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`w-full rounded-xl border p-4 text-left transition ${
        selected
          ? "border-[#FF5A5F] bg-[#FFF9F5]"
          : "border-[#E5E7EB] bg-white hover:border-[#FFB5B7] hover:bg-[#FFF9F5]/50"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-[#FF5A5F] bg-[#FF5A5F]" : "border-[#D1D5DB]"
          }`}
        >
          {selected && <Check size={12} strokeWidth={3} className="text-white" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-[#242424]">{courier.courierName}</p>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B7280]">
                {courier.rating > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Star size={12} className="fill-current" />
                    {courier.rating.toFixed(1)}
                  </span>
                )}

                <span>{courier.isSurface ? "Surface" : "Air"}</span>
              </div>
            </div>

            <p className="shrink-0 text-base font-bold text-[#242424]">
              ₹{formatMoney(courier.rate)}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-[#6B7280] sm:grid-cols-2">
            {courier.estimatedDelivery && (
              <div className="flex items-center gap-1.5">
                <Clock3 size={13} />

                <span>
                  Delivery: <strong className="text-[#242424]">{courier.estimatedDelivery}</strong>
                </span>
              </div>
            )}

            {courier.estimatedDeliveryDays && (
              <div>
                Estimated:{" "}
                <strong className="text-[#242424]">{courier.estimatedDeliveryDays} days</strong>
              </div>
            )}

            {courier.chargeWeight > 0 && (
              <div>
                Chargeable weight:{" "}
                <strong className="text-[#242424]">{courier.chargeWeight} kg</strong>
              </div>
            )}

            {courier.freightCharge > 0 && (
              <div>
                Freight:{" "}
                <strong className="text-[#242424]">₹{formatMoney(courier.freightCharge)}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function CourierLoading() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse rounded-xl border border-[#E5E7EB] p-4">
          <div className="flex gap-3">
            <div className="h-5 w-5 rounded-full bg-[#E5E7EB]" />

            <div className="flex-1">
              <div className="h-4 w-40 rounded bg-[#E5E7EB]" />
              <div className="mt-3 h-3 w-56 rounded bg-[#F0F0F0]" />
              <div className="mt-3 h-3 w-64 rounded bg-[#F0F0F0]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CourierError({ title, message }) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />

        <div>
          <p className="text-sm font-semibold text-red-700">{title}</p>

          <p className="mt-1 text-xs leading-5 text-red-600">{message}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyCouriers() {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#FFF9F5] p-6 text-center">
      <Truck size={24} className="mx-auto text-[#D1D5DB]" />

      <p className="mt-2 text-sm font-semibold text-[#242424]">No courier available</p>

      <p className="mt-1 text-xs leading-5 text-[#6B7280]">
        Shiprocket currently has no courier service available for this shipment.
      </p>
    </div>
  );
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}
