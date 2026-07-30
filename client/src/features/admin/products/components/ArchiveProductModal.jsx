"use client";

import { Archive, Loader2, X } from "lucide-react";

export default function ArchiveProductModal({ product, isArchiving, onClose, onConfirm }) {
  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
            <Archive size={20} className="text-red-500" />
          </div>

          <button
            type="button"
            disabled={isArchiving}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6]"
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="mt-4 text-lg font-bold text-[#242424]">Archive product?</h2>

        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          <span className="font-semibold text-[#242424]">{product.name}</span> will be removed from
          your storefront. Historical product and order data will be preserved.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={isArchiving}
            onClick={onClose}
            className="h-10 rounded-xl border border-[#E5E7EB] px-4 text-sm font-semibold text-[#6B7280]"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isArchiving}
            onClick={onConfirm}
            className="flex h-10 items-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isArchiving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Archiving...
              </>
            ) : (
              <>
                <Archive size={15} />
                Archive Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
