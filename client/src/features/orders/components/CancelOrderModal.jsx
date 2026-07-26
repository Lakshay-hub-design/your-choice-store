"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

export default function CancelOrderModal({
  open,
  onClose,
  onConfirm,
  isCancelling = false,
  error = "",
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isCancelling) {
      return;
    }

    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Overlay */}

      <button
        type="button"
        aria-label="Close cancellation modal"
        onClick={isCancelling ? undefined : onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
      />

      {/* Modal */}

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white shadow-2xl">
        {/* Header */}

        <div className="flex items-start justify-between border-b border-[#EDE9E6] p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertTriangle size={19} />
            </div>

            <div>
              <h2 className="text-base font-bold text-[#242424]">Cancel this order?</h2>

              <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                Once cancelled, this order cannot be restored.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-[#9CA3AF] transition hover:bg-[#FFF9F5] hover:text-[#242424] disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <label htmlFor="cancellationReason" className="text-xs font-semibold text-[#242424]">
            Reason for cancellation
            <span className="ml-1 font-normal text-[#9CA3AF]">(optional)</span>
          </label>

          <textarea
            id="cancellationReason"
            value={reason}
            maxLength={500}
            disabled={isCancelling}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Tell us why you want to cancel this order..."
            rows={4}
            className="mt-2 w-full resize-none rounded-xl border border-[#EDE9E6] px-3.5 py-3 text-sm text-[#242424] transition outline-none placeholder:text-[#9CA3AF] focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/10 disabled:bg-gray-50"
          />

          <div className="mt-1 flex justify-end">
            <span className="text-[10px] text-[#9CA3AF]">{reason.length}/500</span>
          </div>

          {error && (
            <div className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-xs text-red-600">
              {error}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              disabled={isCancelling}
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#EDE9E6] px-4 py-2.5 text-sm font-semibold text-[#242424] transition hover:bg-[#FFF9F5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keep Order
            </button>

            <button
              type="submit"
              disabled={isCancelling}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
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
