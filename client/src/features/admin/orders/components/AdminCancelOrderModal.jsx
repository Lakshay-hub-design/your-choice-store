"use client";

import { useEffect, useState } from "react";

import { AlertTriangle, Loader2, X } from "lucide-react";

export default function AdminCancelOrderModal({ open, order, isCancelling, onClose, onConfirm }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  if (!open || !order) {
    return null;
  }

  const trimmedReason = reason.trim();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!trimmedReason) {
      return;
    }

    onConfirm(trimmedReason);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-order-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        {/* Header */}

        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle size={19} className="text-red-500" />
            </div>

            <div>
              <h2 id="cancel-order-title" className="font-bold text-[#242424]">
                Cancel Order
              </h2>

              <p className="mt-1 text-xs text-[#9CA3AF]">{order.orderNumber}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-[#F3F4F6] hover:text-[#242424] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3">
          <p className="text-xs leading-5 text-red-600">
            Cancelling this order will restore the ordered quantities back to inventory. This action
            cannot be undone.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="cancellationReason" className="text-sm font-semibold text-[#242424]">
            Cancellation reason
          </label>

          <textarea
            id="cancellationReason"
            value={reason}
            disabled={isCancelling}
            onChange={(event) => setReason(event.target.value.slice(0, 500))}
            rows={4}
            maxLength={500}
            placeholder="Enter why this order is being cancelled..."
            className="mt-2 w-full resize-none rounded-xl border border-[#E5E7EB] px-3 py-3 text-sm text-[#242424] transition outline-none placeholder:text-[#9CA3AF] focus:border-red-400 disabled:bg-gray-50"
          />

          <div className="mt-1 flex justify-end">
            <span className="text-[11px] text-[#9CA3AF]">{reason.length}/500</span>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              disabled={isCancelling}
              onClick={onClose}
              className="h-10 rounded-xl border border-[#E5E7EB] px-4 text-sm font-semibold text-[#242424] transition hover:bg-[#F8F9FB] disabled:opacity-50"
            >
              Keep Order
            </button>

            <button
              type="submit"
              disabled={isCancelling || !trimmedReason}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCancelling ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Order"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
