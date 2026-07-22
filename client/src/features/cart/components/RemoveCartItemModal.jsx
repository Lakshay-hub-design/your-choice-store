"use client";

import { Loader2, Trash2, X } from "lucide-react";

export default function RemoveCartItemModal({ item, isRemoving, onClose, onConfirm }) {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-5"
      onClick={() => {
        if (!isRemoving) onClose();
      }}
    >
      <div
        className="w-full rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            type="button"
            disabled={isRemoving}
            onClick={onClose}
            className="rounded-full p-2 text-[#6B7280] transition hover:bg-[#FFF9F5]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <Trash2 size={23} className="text-red-500" />
        </div>

        <div className="mt-5 text-center">
          <h2 className="text-xl font-bold text-[#242424]">Remove from cart?</h2>

          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Are you sure you want to remove{" "}
            <span className="font-semibold text-[#242424]">{item.product?.name}</span> from your
            cart?
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={isRemoving}
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#EDE9E6] px-4 py-3 text-sm font-semibold text-[#242424]"
          >
            Keep Item
          </button>

          <button
            type="button"
            disabled={isRemoving}
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            {isRemoving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Remove
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
