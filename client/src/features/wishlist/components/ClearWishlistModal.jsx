"use client";

import { useState } from "react";

import { AlertTriangle, Loader2, X } from "lucide-react";

import useWishlistStore from "@/store/wishlistStore";

export default function ClearWishlistModal({ open, onClose }) {
  const [isClearing, setIsClearing] = useState(false);

  const [error, setError] = useState("");

  const clearAllItems = useWishlistStore((state) => state.clearAllItems);

  if (!open) {
    return null;
  }

  const handleClear = async () => {
    if (isClearing) {
      return;
    }

    setError("");
    setIsClearing(true);

    try {
      const result = await clearAllItems();

      if (!result.success) {
        setError(result.message || "Unable to clear wishlist.");

        return;
      }

      onClose();
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={isClearing ? undefined : onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isClearing}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-[#9CA3AF] transition hover:bg-[#FFF9F5] hover:text-[#242424]"
        >
          <X size={17} />
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <AlertTriangle size={21} />
        </div>

        <h2 className="mt-4 text-lg font-bold text-[#242424]">Clear your wishlist?</h2>

        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          This will remove all your saved products from the wishlist.
        </p>

        {error && <p className="mt-3 text-xs font-medium text-red-500">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={isClearing}
            onClick={onClose}
            className="h-10 flex-1 rounded-xl border border-[#EDE9E6] text-xs font-semibold text-[#242424] transition hover:bg-[#FFF9F5]"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isClearing}
            onClick={handleClear}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            {isClearing && <Loader2 size={14} className="animate-spin" />}

            {isClearing ? "Clearing..." : "Clear All"}
          </button>
        </div>
      </div>
    </div>
  );
}
