"use client";

import { AlertCircle, CalendarDays, CheckCircle2, LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function SchedulePickupModal({ isOpen, onClose, onSchedule, isScheduling, error }) {
  const [pickupOption, setPickupOption] = useState("next_available");

  const [pickupDate, setPickupDate] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setPickupOption("next_available");
      setPickupDate("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const today = getTodayDate();

  const handleSubmit = () => {
    onSchedule(pickupOption === "specific" ? pickupDate : null);
  };

  const isSubmitDisabled = isScheduling || (pickupOption === "specific" && !pickupDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-[#242424]">Schedule Pickup</h2>

            <p className="mt-1 text-xs text-[#9CA3AF]">
              Choose when Shiprocket should request pickup.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isScheduling}
            className="rounded-lg p-2 text-[#9CA3AF] transition hover:bg-[#FFF9F5] hover:text-[#242424]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">
          {/* Next available */}
          <button
            type="button"
            disabled={isScheduling}
            onClick={() => setPickupOption("next_available")}
            className={`w-full rounded-xl border p-4 text-left transition ${
              pickupOption === "next_available"
                ? "border-[#FF5A5F] bg-[#FFF9F5]"
                : "border-[#E5E7EB] hover:bg-[#FFF9F5]"
            }`}
          >
            <div className="flex items-start gap-3">
              <RadioIndicator selected={pickupOption === "next_available"} />

              <div>
                <p className="text-sm font-semibold text-[#242424]">Next available pickup</p>

                <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                  Let Shiprocket schedule the next available pickup.
                </p>
              </div>
            </div>
          </button>

          {/* Specific date */}
          <button
            type="button"
            disabled={isScheduling}
            onClick={() => setPickupOption("specific")}
            className={`w-full rounded-xl border p-4 text-left transition ${
              pickupOption === "specific"
                ? "border-[#FF5A5F] bg-[#FFF9F5]"
                : "border-[#E5E7EB] hover:bg-[#FFF9F5]"
            }`}
          >
            <div className="flex items-start gap-3">
              <RadioIndicator selected={pickupOption === "specific"} />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#242424]">Choose pickup date</p>

                <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                  Request pickup for a specific date.
                </p>

                {pickupOption === "specific" && (
                  <div className="mt-3" onClick={(event) => event.stopPropagation()}>
                    <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">
                      Pickup date
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={16}
                        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#9CA3AF]"
                      />

                      <input
                        type="date"
                        min={today}
                        value={pickupDate}
                        onChange={(event) => setPickupDate(event.target.value)}
                        disabled={isScheduling}
                        className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pr-3 pl-10 text-sm text-[#242424] transition outline-none focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/10"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </button>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />

                <div>
                  <p className="text-sm font-semibold text-red-700">Unable to schedule pickup</p>

                  <p className="mt-1 text-xs leading-5 text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isScheduling}
            className="rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#242424] transition hover:bg-[#FFF9F5] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e94d52] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isScheduling ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <CalendarDays size={16} />
                Schedule Pickup
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function RadioIndicator({ selected }) {
  return (
    <div
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
        selected ? "border-[#FF5A5F] bg-[#FF5A5F]" : "border-[#D1D5DB]"
      }`}
    >
      {selected && <CheckCircle2 size={12} strokeWidth={3} className="text-white" />}
    </div>
  );
}

function getTodayDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
