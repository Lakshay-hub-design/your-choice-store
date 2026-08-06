"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";

export default function DeleteConfirmationModal({
  open,
  title = "Delete Item",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onClose,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle size={22} className="text-red-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#242424]">{title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-[#F3F4F6]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}

        <div className="px-6 py-6">
          <p className="leading-7 text-[#6B7280]">{description}</p>
        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-[#E5E7EB] px-6 py-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-[#E5E7EB] px-5 py-2.5 font-medium transition hover:bg-[#F9FAFB]"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex min-w-[120px] items-center justify-center rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
