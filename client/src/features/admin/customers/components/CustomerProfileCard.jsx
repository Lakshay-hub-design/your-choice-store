import Image from "next/image";
import { Mail, Phone, Calendar, Shield, Clock3 } from "lucide-react";

export default function CustomerProfileCard({ customer }) {
  const avatar =
    customer.avatar?.url || customer.avatar?.secure_url || "/images/avatar-placeholder.png";

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FFF5F2] via-white to-[#FFF5F2] px-8 py-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {/* Avatar */}
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg">
            <Image src={avatar} alt={customer.fullName} fill className="object-cover" />
          </div>

          {/* Customer Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-bold text-gray-900">{customer.fullName}</h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  customer.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {customer.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#FF5A5F]" />
                {customer.email}
              </div>

              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[#FF5A5F]" />
                {customer.phone || "No phone number"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-5 p-8 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={<Calendar size={18} />}
          label="Joined"
          value={new Date(customer.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        />

        <InfoCard icon={<Shield size={18} />} label="Role" value={customer.role} />

        <InfoCard
          icon={<Clock3 size={18} />}
          label="Last Login"
          value={
            customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString("en-IN") : "Never"
          }
        />

        <InfoCard
          icon={<Mail size={18} />}
          label="Customer ID"
          value={`#${customer._id.slice(-8)}`}
        />
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#FF5A5F] hover:bg-white hover:shadow-md">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF1F1] text-[#FF5A5F]">
        {icon}
      </div>

      <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">{label}</p>

      <p className="mt-2 text-base font-semibold break-words text-gray-900">{value}</p>
    </div>
  );
}
