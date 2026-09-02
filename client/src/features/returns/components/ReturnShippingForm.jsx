"use client";

import { useState } from "react";
import { Loader2, Truck } from "lucide-react";

import { markReturnAsShipped } from "@/features/returns/services/returnService";

export default function ReturnShippingForm({ returnId, onSuccess }) {
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
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0EA] text-[#FF5A5F]">
          <Truck size={18} />
        </div>

        <div>
          <h2 className="font-bold text-[#242424]">Ship Your Return</h2>

          <p className="mt-1 text-xs leading-5 text-[#6B7280]">
            Your return has been approved. Ship the product to the return address provided by us and
            enter the tracking details below.
          </p>
        </div>
      </div>

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
          disabled={loading || !courierName.trim() || !trackingNumber.trim()}
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
