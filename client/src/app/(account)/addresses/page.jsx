"use client";

import { useEffect, useState } from "react";

import { AlertCircle, MapPin, Plus } from "lucide-react";

import useAddressStore from "@/store/addressStore";

import AddressCard from "@/components/account/address/AddressCard";

import AddressFormModal from "@/components/account/address/AddressFormModal";

import DeleteAddressModal from "@/components/account/address/DeleteAddressModal";

export default function AddressesPage() {
  const { addresses, isLoading, error, fetchAddresses, removeAddress, setDefault } =
    useAddressStore();

  const [addressToDelete, setAddressToDelete] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [settingDefaultAddress, setSettingDefaultAddress] = useState(null);

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleEdit = (address) => {
    setSelectedAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleDelete = (address) => {
    setAddressToDelete(address);
  };
  const handleConfirmDelete = async () => {
    if (!addressToDelete?._id) {
      return;
    }

    setIsDeleting(true);

    const result = await removeAddress(addressToDelete._id);

    setIsDeleting(false);

    if (!result.success) {
      // We'll replace this with toast later
      alert(result.message);
      return;
    }

    setAddressToDelete(null);
  };

  const handleSetDefault = async (id) => {
    setSettingDefaultAddress(id);

    const result = await setDefault(id);

    setSettingDefaultAddress(null);

    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#242424]">Manage Addresses</h1>

          <p className="mt-1 text-sm text-[#6B7280]">Add and manage your delivery addresses.</p>
        </div>

        <button
          type="button"
          onClick={handleAddAddress}
          className="hidden items-center gap-2 rounded-xl bg-[#FF5A5F] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,90,95,0.2)] transition hover:-translate-y-0.5 hover:bg-[#f24d52] sm:inline-flex"
        >
          <Plus size={18} />
          Add New Address
        </button>
      </div>

      {/* Mobile Add Button */}
      <button
        type="button"
        onClick={handleAddAddress}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-5 py-3 text-sm font-semibold text-white sm:hidden"
      >
        <Plus size={18} />
        Add New Address
      </button>

      {/* Loading */}
      {isLoading && <AddressLoading />}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={21} className="mt-0.5 shrink-0 text-red-500" />

            <div>
              <h3 className="font-semibold text-red-700">Unable to load addresses</h3>

              <p className="mt-1 text-sm text-red-600">{error}</p>

              <button
                type="button"
                onClick={fetchAddresses}
                className="mt-4 text-sm font-semibold text-red-700 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && addresses.length === 0 && (
        <EmptyAddresses onAdd={handleAddAddress} />
      )}

      {/* Address List */}
      {!isLoading && !error && addresses.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={
                settingDefaultAddress === address._id ? "pointer-events-none opacity-50" : ""
              }
            >
              <AddressCard
                address={address}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            </div>
          ))}
        </div>
      )}

      <AddressFormModal
        isOpen={isAddressModalOpen}
        address={selectedAddress}
        onClose={() => {
          setIsAddressModalOpen(false);
          setSelectedAddress(null);
        }}
      />

      <DeleteAddressModal
        isOpen={Boolean(addressToDelete)}
        address={addressToDelete}
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setAddressToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

/* =====================================
   EMPTY STATE
===================================== */

function EmptyAddresses({ onAdd }) {
  return (
    <div className="rounded-2xl border border-[#EDE9E6] bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FF5A5F]/10">
        <MapPin size={34} strokeWidth={1.6} className="text-[#FF5A5F]" />
      </div>

      <h2 className="mt-6 text-xl font-semibold text-[#242424]">No saved addresses yet</h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
        Add a delivery address to make your checkout experience faster and easier.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#f24d52]"
      >
        <Plus size={18} />
        Add Your First Address
      </button>
    </div>
  );
}

/* =====================================
   LOADING STATE
===================================== */

function AddressLoading() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {[1, 2].map((item) => (
        <div
          key={item}
          className="h-[240px] animate-pulse rounded-2xl border border-[#EDE9E6] bg-white p-5"
        >
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#EDE9E6]" />

            <div className="flex-1">
              <div className="h-4 w-32 rounded bg-[#EDE9E6]" />

              <div className="mt-3 h-3 w-20 rounded bg-[#EDE9E6]" />
            </div>
          </div>

          <div className="mt-7 space-y-3">
            <div className="h-3 w-full rounded bg-[#EDE9E6]" />

            <div className="h-3 w-3/4 rounded bg-[#EDE9E6]" />

            <div className="h-3 w-1/2 rounded bg-[#EDE9E6]" />
          </div>
        </div>
      ))}
    </div>
  );
}
