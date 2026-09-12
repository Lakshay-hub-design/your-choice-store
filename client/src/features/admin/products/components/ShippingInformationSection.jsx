import { Box, Info } from "lucide-react";

export default function ShippingInformationSection({ shipping, updateShipping }) {
  const dimensions = shipping?.dimensions || {};

  return (
    <section className="rounded-2xl border border-[#EDE9E6] bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}

      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7C5CFC]/10 text-[#7C5CFC]">
          <Box size={20} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#242424]">Shipping Information</h2>

          <p className="mt-1 text-sm text-[#6B7280]">
            Enter the packaged product weight and dimensions for shipping calculations.
          </p>
        </div>
      </div>

      {/* Info */}

      <div className="mb-6 flex gap-3 rounded-xl border border-[#EDE9E6] bg-[#FFF9F5] p-4">
        <Info size={18} className="mt-0.5 shrink-0 text-[#7C5CFC]" />

        <div className="text-sm text-[#6B7280]">
          <p className="font-medium text-[#242424]">Use packaged measurements</p>

          <p className="mt-1">
            Weight should be in kilograms (kg), and dimensions should be in centimeters (cm).
            Include the packaging when measuring.
          </p>
        </div>
      </div>

      {/* Weight */}

      <div>
        <label htmlFor="shipping-weight" className="mb-2 block text-sm font-medium text-[#242424]">
          Weight
        </label>

        <div className="relative">
          <input
            id="shipping-weight"
            type="number"
            min="0.001"
            step="0.001"
            value={shipping?.weight ?? ""}
            onChange={(event) => updateShipping("weight", event.target.value)}
            placeholder="e.g. 0.35"
            className="w-full rounded-xl border border-[#EDE9E6] bg-white px-4 py-3 pr-16 text-sm text-[#242424] transition outline-none placeholder:text-[#9CA3AF] focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/10"
          />

          <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-[#6B7280]">
            kg
          </span>
        </div>
      </div>

      {/* Dimensions */}

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-[#242424]">Package Dimensions</label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Length */}

          <div>
            <label
              htmlFor="shipping-length"
              className="mb-2 block text-xs font-medium text-[#6B7280]"
            >
              Length
            </label>

            <div className="relative">
              <input
                id="shipping-length"
                type="number"
                min="0.1"
                step="0.1"
                value={dimensions.length ?? ""}
                onChange={(event) =>
                  updateShipping("dimensions", {
                    ...dimensions,
                    length: event.target.value,
                  })
                }
                placeholder="Length"
                className="w-full rounded-xl border border-[#EDE9E6] bg-white px-4 py-3 pr-12 text-sm text-[#242424] transition outline-none placeholder:text-[#9CA3AF] focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/10"
              />

              <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-[#6B7280]">
                cm
              </span>
            </div>
          </div>

          {/* Breadth */}

          <div>
            <label
              htmlFor="shipping-breadth"
              className="mb-2 block text-xs font-medium text-[#6B7280]"
            >
              Breadth
            </label>

            <div className="relative">
              <input
                id="shipping-breadth"
                type="number"
                min="0.1"
                step="0.1"
                value={dimensions.breadth ?? ""}
                onChange={(event) =>
                  updateShipping("dimensions", {
                    ...dimensions,
                    breadth: event.target.value,
                  })
                }
                placeholder="Breadth"
                className="w-full rounded-xl border border-[#EDE9E6] bg-white px-4 py-3 pr-12 text-sm text-[#242424] transition outline-none placeholder:text-[#9CA3AF] focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/10"
              />

              <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-[#6B7280]">
                cm
              </span>
            </div>
          </div>

          {/* Height */}

          <div>
            <label
              htmlFor="shipping-height"
              className="mb-2 block text-xs font-medium text-[#6B7280]"
            >
              Height
            </label>

            <div className="relative">
              <input
                id="shipping-height"
                type="number"
                min="0.1"
                step="0.1"
                value={dimensions.height ?? ""}
                onChange={(event) =>
                  updateShipping("dimensions", {
                    ...dimensions,
                    height: event.target.value,
                  })
                }
                placeholder="Height"
                className="w-full rounded-xl border border-[#EDE9E6] bg-white px-4 py-3 pr-12 text-sm text-[#242424] transition outline-none placeholder:text-[#9CA3AF] focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/10"
              />

              <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-[#6B7280]">
                cm
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
