import { MapPin, Home, Phone, MapPinned } from "lucide-react";

export default function CustomerAddresses({ addresses = [] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-[#FFF5F2] via-white to-[#FFF5F2] px-7 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF1F1] text-[#FF5A5F]">
            <MapPinned size={20} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>

            <p className="text-sm text-gray-500">
              {addresses.length} saved address
              {addresses.length !== 1 && "es"}
            </p>
          </div>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <MapPin size={34} />
          </div>

          <h3 className="text-lg font-semibold text-gray-900">No Saved Addresses</h3>

          <p className="mt-2 text-sm text-gray-500">
            This customer hasn't added any addresses yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 p-7 lg:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address._id}
              className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5A5F] hover:shadow-lg"
            >
              {/* Top */}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F1] text-[#FF5A5F]">
                    <Home size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">{address.fullName}</h3>

                    <p className="text-sm text-gray-500">Delivery Address</p>
                  </div>
                </div>

                {address.isDefault && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Default
                  </span>
                )}
              </div>

              {/* Address */}

              <div className="mt-6 space-y-2">
                <div className="flex gap-3">
                  <MapPin size={18} className="mt-0.5 text-gray-400" />

                  <div className="text-sm leading-6 text-gray-600">
                    <p>{address.houseNumber}</p>

                    {address.landmark && <p>{address.landmark}</p>}

                    <p>
                      {address.city}, {address.state}
                    </p>

                    <p>{address.postalCode}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}

              <div className="mt-6 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <Phone size={17} className="text-[#FF5A5F]" />

                  {address.phone}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
