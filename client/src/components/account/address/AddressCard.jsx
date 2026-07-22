"use client";

import { Check, Home, MapPin, Pencil, Phone, Star, Trash2 } from "lucide-react";

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  return (
    <div
      className={`relative rounded-2xl border bg-white p-5 transition ${
        address.isDefault
          ? "border-[#FF5A5F]/40 shadow-[0_5px_20px_rgba(255,90,95,0.08)]"
          : "border-[#EDE9E6]"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Address Type Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF5A5F]/10">
            {address.addressType === "HOME" ? (
              <Home size={19} className="text-[#FF5A5F]" />
            ) : (
              <MapPin size={19} className="text-[#FF5A5F]" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Customer Name */}
              <h3 className="font-semibold text-[#242424]">{address.fullName}</h3>

              {/* Address Type */}
              <span className="rounded-full bg-[#FFF9F5] px-2.5 py-1 text-[10px] font-semibold text-[#6B7280] uppercase">
                {address.addressType || "OTHER"}
              </span>
            </div>

            {/* Default Address */}
            {address.isDefault && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-700">
                <Check size={11} />
                Default Address
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Address Details */}
      <div className="mt-5 pl-0 sm:pl-[52px]">
        {/* House Number + Formatted Address */}
        <p className="text-sm leading-6 font-medium text-[#242424]">
          {address.houseNumber}

          {address.houseNumber && address.formattedAddress && ", "}

          {address.formattedAddress}
        </p>

        {/* Landmark */}
        {address.landmark && (
          <p className="mt-1 text-sm text-[#6B7280]">Landmark: {address.landmark}</p>
        )}

        {/* City, State, PIN */}
        <p className="mt-1 text-sm text-[#6B7280]">
          {address.city}
          {address.city && address.state && ", "}
          {address.state}

          {address.postalCode && <> - {address.postalCode}</>}
        </p>

        {/* Phone */}
        {address.phone && (
          <div className="mt-3 flex items-center gap-2 text-sm text-[#6B7280]">
            <Phone size={15} />

            <span>{address.phone}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#EDE9E6] pt-4 sm:ml-[52px]">
        {/* Edit */}
        <button
          type="button"
          onClick={() => onEdit(address)}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#7C5CFC] transition hover:text-[#6244e5]"
        >
          <Pencil size={15} />
          Edit
        </button>

        <div className="h-4 w-px bg-[#EDE9E6]" />

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(address)}
          className="inline-flex items-center gap-2 text-sm font-medium text-red-500 transition hover:text-red-600"
        >
          <Trash2 size={15} />
          Delete
        </button>

        {/* Set Default */}
        {!address.isDefault && (
          <>
            <div className="h-4 w-px bg-[#EDE9E6]" />

            <button
              type="button"
              onClick={() => onSetDefault(address._id)}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#B98500] transition hover:text-[#9A7000]"
            >
              <Star size={15} />
              Set as Default
            </button>
          </>
        )}
      </div>
    </div>
  );
}
