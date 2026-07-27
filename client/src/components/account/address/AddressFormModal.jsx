"use client";

import { useEffect, useState } from "react";

import { Home, Loader2, MapPin, X } from "lucide-react";

import useAddressStore from "@/store/addressStore";

import GoogleAddressAutocomplete from "@/components/account/address/GoogleAddressAutocomplete";
import { toast } from "sonner";

const initialForm = {
  fullName: "",
  phone: "",

  houseNumber: "",
  formattedAddress: "",

  landmark: "",

  city: "",
  state: "",
  postalCode: "",

  addressType: "HOME",

  latitude: null,
  longitude: null,
};

export default function AddressFormModal({ isOpen, onClose, address = null }) {
  const createNewAddress = useAddressStore((state) => state.createNewAddress);

  const editAddress = useAddressStore((state) => state.editAddress);

  const [form, setForm] = useState(initialForm);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  const isEditing = Boolean(address);

  useEffect(() => {
    if (!isOpen) return;

    if (address) {
      setForm({
        fullName: address.fullName || "",

        phone: address.phone || "",

        houseNumber: address.houseNumber || "",

        formattedAddress: address.formattedAddress || "",

        landmark: address.landmark || "",

        city: address.city || "",

        state: address.state || "",

        postalCode: address.postalCode || "",

        addressType: address.addressType || "HOME",

        longitude: address.location?.coordinates?.[0] ?? null,

        latitude: address.location?.coordinates?.[1] ?? null,
      });
    } else {
      setForm(initialForm);
    }

    setError("");
  }, [address, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.houseNumber.trim()) {
      setError("House / Flat number is required");
      return;
    }

    if (!form.formattedAddress.trim()) {
      setError("Address is required");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      fullName: form.fullName,
      phone: form.phone,
      houseNumber: form.houseNumber.trim(),
      formattedAddress: form.formattedAddress.trim(),
      landmark: form.landmark.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      addressType: form.addressType,
    };

    // Only send location when real coordinates exist
    if (form.latitude !== null && form.longitude !== null) {
      payload.location = {
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      };
    }

    const result = isEditing
      ? await editAddress(address._id, payload)
      : await createNewAddress(payload);

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    if (isEditing) {
      toast.success("Address updated successfully");
    } else {
      toast.success("Address added successfully");
    }

    onClose();
  };

  const handleGoogleAddressSelect = (selectedAddress) => {
    setForm((previous) => ({
      ...previous,

      formattedAddress: selectedAddress.formattedAddress,

      city: selectedAddress.city,

      state: selectedAddress.state,

      postalCode: selectedAddress.postalCode,

      latitude: selectedAddress.latitude,

      longitude: selectedAddress.longitude,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6">
      {/* Modal */}
      <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white sm:max-w-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EDE9E6] bg-white px-5 py-4 sm:px-7">
          <div>
            <h2 className="text-xl font-bold text-[#242424]">
              {isEditing ? "Edit Address" : "Add Delivery Address"}
            </h2>

            <p className="mt-1 text-sm text-[#6B7280]">Add your delivery location details.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#FFF9F5]"
          >
            <X size={21} className="text-[#6B7280]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-7">
          {/* Location Selection */}
          <div>
            <h3 className="text-sm font-semibold text-[#242424]">Find your address</h3>

            <p className="mt-1 text-xs text-[#6B7280]">
              Search for your location or use your current location.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="">
                <GoogleAddressAutocomplete onAddressSelect={handleGoogleAddressSelect} />
              </div>
            </div>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#EDE9E6]" />

              <span className="text-xs text-[#9CA3AF]">ADDRESS DETAILS</span>

              <div className="h-px flex-1 bg-[#EDE9E6]" />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />

            <Input
              label="Mobile Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter mobile number"
              required
            />
          </div>

          {/* Address */}
          <div className="mt-4">
            <Input
              label="House / Flat / Building"
              name="houseNumber"
              value={form.houseNumber}
              onChange={handleChange}
              placeholder="House no., flat, building"
              required
            />
          </div>

          <div className="mt-4">
            <Input
              label="Street / Area / Full Address"
              name="formattedAddress"
              value={form.formattedAddress}
              onChange={handleChange}
              placeholder="Street, colony, area"
              required
            />
          </div>

          <div className="mt-4">
            <Input
              label="Landmark (Optional)"
              name="landmark"
              value={form.landmark}
              onChange={handleChange}
              placeholder="Near hospital, school, etc."
            />
          </div>

          {/* City */}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
              required
            />

            <Input
              label="State"
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="State"
              required
            />

            <Input
              label="PIN Code"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              placeholder="PIN code"
              required
            />
          </div>

          {/* Address Type */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-[#242424]">Save address as</p>

            <div className="mt-3 flex gap-3">
              <AddressTypeButton
                active={form.addressType === "HOME"}
                onClick={() =>
                  setForm((previous) => ({
                    ...previous,
                    addressType: "HOME",
                  }))
                }
                icon={Home}
                label="Home"
              />

              <AddressTypeButton
                active={form.addressType === "WORK"}
                onClick={() =>
                  setForm((previous) => ({
                    ...previous,
                    addressType: "WORK",
                  }))
                }
                icon={MapPin}
                label="Work"
              />

              <AddressTypeButton
                active={form.addressType === "OTHER"}
                onClick={() =>
                  setForm((previous) => ({
                    ...previous,
                    addressType: "OTHER",
                  }))
                }
                icon={MapPin}
                label="Other"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          {/* Actions */}
          <div className="mt-7 flex gap-3 border-t border-[#EDE9E6] pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-[#EDE9E6] px-5 py-3 text-sm font-semibold text-[#242424] transition hover:bg-[#FFF9F5]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#f24d52] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={17} className="animate-spin" />}

              {isSubmitting ? "Saving..." : isEditing ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-[#6B7280]">{label}</span>

      <input
        {...props}
        className="w-full rounded-xl border border-[#EDE9E6] bg-white px-4 py-3 text-sm text-[#242424] transition outline-none placeholder:text-[#9CA3AF] focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/10"
      />
    </label>
  );
}

function AddressTypeButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "border-[#FF5A5F] bg-[#FF5A5F]/10 text-[#FF5A5F]"
          : "border-[#EDE9E6] text-[#6B7280] hover:border-[#FF5A5F]/50"
      }`}
    >
      <Icon size={16} />

      {label}
    </button>
  );
}
