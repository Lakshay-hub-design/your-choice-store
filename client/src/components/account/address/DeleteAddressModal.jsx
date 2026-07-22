"use client";

import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

export default function DeleteAddressModal({ isOpen, address, isDeleting, onClose, onConfirm }) {
  if (!isOpen || !address) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="w-full rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Close */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] transition hover:bg-[#FFF9F5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Icon */}
        <div className="-mt-2 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
              <Trash2 size={22} className="text-red-500" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-5 text-center">
          <h2 className="text-xl font-bold text-[#242424]">Delete this address?</h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6B7280]">
            Are you sure you want to remove this address? This action cannot be undone.
          </p>
        </div>

        {/* Address Preview */}
        <div className="mt-5 rounded-2xl border border-[#EDE9E6] bg-[#FFF9F5] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50">
              <AlertTriangle size={18} className="text-red-500" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-[#242424]">{address.fullName}</p>

                {address.addressType && (
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[#6B7280]">
                    {address.addressType}
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm leading-5 text-[#6B7280]">
                {address.houseNumber}

                {address.houseNumber && address.formattedAddress && ", "}

                {address.formattedAddress}
              </p>

              {(address.city || address.state || address.postalCode) && (
                <p className="mt-1 text-sm text-[#6B7280]">
                  {address.city}

                  {address.city && address.state && ", "}

                  {address.state}

                  {address.postalCode && ` - ${address.postalCode}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-[#EDE9E6] px-4 py-3 text-sm font-semibold text-[#242424] transition hover:bg-[#FFF9F5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={17} />
                Delete Address
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
