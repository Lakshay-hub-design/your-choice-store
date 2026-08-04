"use client";

import Image from "next/image";
import Link from "next/link";

import CustomerStatusToggle from "./CustomerStatusToggle";
import CustomerActionsMenu from "./CustomerActionsMenu";

export default function CustomerTable({ customers, onStatusChange, onArchive, onRestore }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[1150px] border-separate border-spacing-0">
          <thead>
            <tr className="sticky top-0 z-10 bg-[#F8FAFC] text-left">
              <TableHeading>Customer</TableHeading>

              <TableHeading>Email</TableHeading>

              <TableHeading>Phone</TableHeading>

              <TableHeading>Orders</TableHeading>

              <TableHeading>Total Spent</TableHeading>

              <TableHeading>Joined</TableHeading>

              <TableHeading>Status</TableHeading>

              <TableHeading>Actions</TableHeading>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <CustomerRow
                key={customer._id}
                customer={customer}
                onStatusChange={onStatusChange}
                onArchive={onArchive}
                onRestore={onRestore}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerRow({ customer, onStatusChange, onArchive, onRestore }) {
  const avatar =
    customer.avatar?.url || customer.avatar?.secure_url || "/images/avatar-placeholder.png";

  return (
    <tr className="group border-b border-gray-100 transition-all duration-200 odd:bg-white even:bg-gray-50/30 hover:bg-orange-50/40">
      {/* Customer */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-md">
            <Image
              src={avatar}
              alt={customer.fullName}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>

          <div>
            <Link
              href={`/admin/customers/${customer._id}`}
              className="font-semibold text-[#242424] hover:text-[#FF5A5F]"
            >
              {customer.fullName}
            </Link>

            <p className="text-xs text-[#9CA3AF]">ID: {customer._id.slice(-6)}</p>
          </div>
        </div>
      </td>

      {/* Email */}

      <td className="px-5 py-4">
        <p className="text-sm text-[#374151]">{customer.email}</p>
      </td>

      {/* Phone */}

      <td className="px-5 py-4">
        <p className="text-sm text-[#6B7280]">{customer.phone || "—"}</p>
      </td>

      {/* Orders */}

      <td className="px-5 py-4">
        <span className="font-semibold text-[#242424]">{customer.totalOrders}</span>
      </td>

      {/* Total Spent */}

      <td className="px-5 py-4">
        <span className="font-semibold text-[#242424]">
          ₹{Number(customer.totalSpent || 0).toLocaleString("en-IN")}
        </span>
      </td>

      {/* Joined */}

      <td className="px-5 py-4 text-sm text-[#6B7280]">
        {new Date(customer.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </td>

      {/* Status */}

      <td className="px-5 py-4">
        <CustomerStatusToggle
          customerId={customer._id}
          isActive={customer.isActive}
          onSuccess={onStatusChange}
        />
      </td>

      {/* Actions */}

      <td className="px-5 py-4">
        <CustomerActionsMenu customer={customer} onArchive={onArchive} onRestore={onRestore} />
      </td>
    </tr>
  );
}

function TableHeading({ children }) {
  return (
    <th className="px-5 py-3 text-xs font-semibold tracking-wide text-[#6B7280] uppercase">
      {children}
    </th>
  );
}
