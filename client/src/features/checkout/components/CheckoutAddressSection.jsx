import Link from "next/link";

import { Check, Home, MapPin, Plus } from "lucide-react";

export default function CheckoutAddressSection({ addresses, selectedAddressId, onSelect }) {
  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin size={19} className="text-[#FF5A5F]" />

            <h2 className="font-bold text-[#242424]">Delivery Address</h2>
          </div>

          <p className="mt-1 text-xs text-[#6B7280]">Choose where you want your order delivered.</p>
        </div>

        <Link
          href="/account/addresses"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#7C5CFC]"
        >
          <Plus size={14} />
          Add
        </Link>
      </div>

      {!addresses?.length ? (
        <NoAddress />
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => {
            const selected = selectedAddressId === address._id;

            return (
              <button
                key={address._id}
                type="button"
                onClick={() => onSelect(address._id)}
                className={`relative w-full rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-[#FF5A5F] bg-[#FF5A5F]/[0.03] ring-1 ring-[#FF5A5F]/20"
                    : "border-[#EDE9E6] hover:border-[#FF5A5F]/40"
                }`}
              >
                {selected && (
                  <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5A5F] text-white">
                    <Check size={12} />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Home size={15} className="text-[#FF5A5F]" />

                  <span className="text-xs font-bold text-[#6B7280] uppercase">
                    {address.addressType || "Address"}
                  </span>

                  {address.isDefault && (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-semibold text-green-700">
                      Default
                    </span>
                  )}
                </div>

                <p className="mt-3 pr-7 text-sm font-semibold text-[#242424]">{address.fullName}</p>

                <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                  {address.houseNumber}, {address.formattedAddress}
                </p>

                <p className="text-xs leading-5 text-[#6B7280]">
                  {address.city}, {address.state} - {address.postalCode}
                </p>

                <p className="mt-2 text-xs font-medium text-[#242424]">+91 {address.phone}</p>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function NoAddress() {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-[#EDE9E6] bg-[#FFF9F5] p-6 text-center">
      <MapPin size={27} className="mx-auto text-[#FF5A5F]" />

      <p className="mt-3 text-sm font-semibold text-[#242424]">No delivery address</p>

      <p className="mt-1 text-xs text-[#6B7280]">Add an address before placing your order.</p>

      <Link
        href="/account/addresses"
        className="mt-4 inline-flex items-center gap-1 rounded-lg bg-[#FF5A5F] px-4 py-2 text-xs font-semibold text-white"
      >
        <Plus size={14} />
        Add Address
      </Link>
    </div>
  );
}
