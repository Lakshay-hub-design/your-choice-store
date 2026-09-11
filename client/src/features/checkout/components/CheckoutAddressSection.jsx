import Link from "next/link";

import { Check, ChevronRight, Home, MapPin, Plus, Smartphone } from "lucide-react";

export default function CheckoutAddressSection({ addresses, selectedAddressId, onSelect }) {
  return (
    <div>
      {/* ================================
          HEADER
      ================================= */}

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF1F1]">
            <MapPin size={18} className="text-[#FF5A5F]" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#242424]">Select delivery address</h3>

            <p className="mt-1 text-xs leading-5 text-[#6B7280]">
              Choose where you want your order delivered.
            </p>
          </div>
        </div>

        <Link
          href="/account/addresses"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#EDE9E6] px-3 py-2 text-xs font-semibold text-[#7C5CFC] transition hover:border-[#7C5CFC]/30 hover:bg-[#7C5CFC]/5"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Add Address</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* ================================
          ADDRESSES
      ================================= */}

      {!addresses?.length ? (
        <NoAddress />
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => {
            const selected = selectedAddressId === address._id;

            return (
              <AddressCard
                key={address._id}
                address={address}
                selected={selected}
                onSelect={() => onSelect(address._id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ========================================
   ADDRESS CARD
======================================== */

function AddressCard({ address, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
        selected
          ? "border-[#FF5A5F] bg-[#FFF9F9] shadow-[0_4px_16px_rgba(255,90,95,0.08)] ring-1 ring-[#FF5A5F]/20"
          : "border-[#EDE9E6] bg-white hover:border-[#FFB5B7] hover:shadow-[0_4px_16px_rgba(36,36,36,0.04)]"
      }`}
    >
      {/* ================================
          TOP ROW
      ================================= */}

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              selected ? "bg-[#FF5A5F]/10" : "bg-[#F7F5F3]"
            }`}
          >
            <Home size={14} className={selected ? "text-[#FF5A5F]" : "text-[#6B7280]"} />
          </div>

          <span className="truncate text-[11px] font-bold tracking-wide text-[#6B7280] uppercase">
            {address.addressType || "Address"}
          </span>
        </div>

        {/* Selection indicator */}

        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
            selected ? "border-[#FF5A5F] bg-[#FF5A5F] text-white" : "border-[#D6D3D1] bg-white"
          }`}
        >
          {selected && <Check size={12} strokeWidth={3} />}
        </div>
      </div>

      {/* ================================
          DEFAULT BADGE
      ================================= */}

      {address.isDefault && (
        <div className="mt-3">
          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
            Default address
          </span>
        </div>
      )}

      {/* ================================
          NAME
      ================================= */}

      <div className={address.isDefault ? "mt-3" : "mt-4"}>
        <p className="text-sm font-bold text-[#242424]">{address.fullName}</p>
      </div>

      {/* ================================
          ADDRESS
      ================================= */}

      <div className="mt-2 text-xs leading-5 text-[#6B7280]">
        <p>
          {address.houseNumber}
          {address.formattedAddress ? `, ${address.formattedAddress}` : ""}
        </p>

        <p>
          {address.city}, {address.state}
          {" - "}
          {address.postalCode}
        </p>
      </div>

      {/* ================================
          PHONE
      ================================= */}

      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#242424]">
        <Smartphone size={13} className="text-[#9CA3AF]" />

        <span>+91 {address.phone}</span>
      </div>

      {/* ================================
          SELECTED LABEL
      ================================= */}

      {selected && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#FF5A5F]">
          <Check size={13} />

          <span>Selected for delivery</span>
        </div>
      )}

      {/* ================================
          HOVER ARROW
      ================================= */}

      {!selected && (
        <ChevronRight
          size={15}
          className="absolute right-4 bottom-4 text-[#D1D5DB] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      )}
    </button>
  );
}

/* ========================================
   NO ADDRESS
======================================== */

function NoAddress() {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-[#E6E0DC] bg-[#FFF9F5] px-5 py-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
        <MapPin size={22} className="text-[#FF5A5F]" />
      </div>

      <h3 className="mt-4 text-sm font-bold text-[#242424]">No delivery address</h3>

      <p className="mx-auto mt-1.5 max-w-xs text-xs leading-5 text-[#6B7280]">
        Add a delivery address to continue with your order.
      </p>

      <Link
        href="/account/addresses"
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#FF5A5F] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_5px_14px_rgba(255,90,95,0.15)] transition hover:bg-[#f1494e]"
      >
        <Plus size={14} />
        Add Address
      </Link>
    </div>
  );
}
