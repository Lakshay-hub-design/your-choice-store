"use client";

import { useState } from "react";
import { AlertCircle, Loader2, MapPin, Package, Truck } from "lucide-react";

import { markReturnAsShipped } from "@/features/returns/services/returnService";

export default function ReturnShippingForm({ returnId, returnAddress, onSuccess }) {
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await markReturnAsShipped({
        returnId,
        courierName,
        trackingNumber,
      });

      onSuccess?.(data);
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to update return status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0EA] text-[#FF5A5F]">
          <Truck size={18} />
        </div>

        <div>
          <h2 className="font-bold text-[#242424]">Ship Your Return</h2>

          <p className="mt-1 text-xs leading-5 text-[#6B7280]">
            Your return has been approved. Please send the product to the return address below.
          </p>
        </div>
      </div>

      {/* How to ship */}
      <div className="mt-5 rounded-xl bg-[#FFF9F5] p-4">
        <div className="flex items-start gap-3">
          <Package size={17} className="mt-0.5 shrink-0 text-[#FF5A5F]" />

          <div>
            <p className="text-xs font-bold text-[#242424]">How to ship your return</p>

            <ol className="mt-2 space-y-1.5 text-xs leading-5 text-[#6B7280]">
              <li>1. Pack the product securely to avoid damage during transit.</li>

              <li>2. Include all accessories and items that came with the order.</li>

              <li>3. Book a courier from your address.</li>

              <li>4. Send the package to the return address shown below.</li>

              <li>5. Keep your courier receipt until the return is completed.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Return Address */}
      <div className="mt-4 rounded-xl border border-[#EDE9E6] bg-white p-4">
        <div className="flex items-start gap-3">
          <MapPin size={18} className="mt-0.5 shrink-0 text-[#FF5A5F]" />

          <div className="min-w-0">
            <p className="text-xs font-bold text-[#242424]">Return Address</p>

            {returnAddress ? (
              <div className="mt-2 text-xs leading-5 text-[#6B7280]">
                {returnAddress.name && (
                  <p className="font-semibold text-[#242424]">{returnAddress.name}</p>
                )}

                {returnAddress.addressLine1 && <p>{returnAddress.addressLine1}</p>}

                {returnAddress.addressLine2 && <p>{returnAddress.addressLine2}</p>}

                <p>
                  {[returnAddress.city, returnAddress.state, returnAddress.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                {returnAddress.phone && (
                  <p className="mt-1">
                    Phone:{" "}
                    <span className="font-semibold text-[#242424]">{returnAddress.phone}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-600" />

                <p className="text-xs leading-5 text-amber-700">
                  Return address is currently unavailable. Please contact support before shipping
                  the product.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Courier Details */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#242424]">Courier Name</label>

          <input
            value={courierName}
            onChange={(event) => setCourierName(event.target.value)}
            placeholder="e.g. Delhivery"
            className="w-full rounded-xl border border-[#EDE9E6] bg-[#FFF9F5] px-4 py-3 text-sm text-black transition outline-none focus:border-[#FF5A5F]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#242424]">
            Tracking Number
          </label>

          <input
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            placeholder="Enter tracking number"
            className="w-full rounded-xl border border-[#EDE9E6] bg-[#FFF9F5] px-4 py-3 text-sm text-black transition outline-none focus:border-[#FF5A5F]"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || !courierName.trim() || !trackingNumber.trim() || !returnAddress}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#f1494e] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Truck size={16} />
              I've Shipped the Return
            </>
          )}
        </button>
      </form>
    </section>
  );
}
