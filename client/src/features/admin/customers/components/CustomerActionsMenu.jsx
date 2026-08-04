"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import { MoreHorizontal, User, Archive, ArchiveRestore, Copy } from "lucide-react";

import { toast } from "sonner";

import {
  archiveCustomer,
  restoreCustomer,
} from "@/features/admin/customers/services/adminCustomerService";

export default function CustomerActionsMenu({ customer, onArchive, onRestore }) {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleArchive = async () => {
    try {
      setLoading(true);

      const updated = await archiveCustomer(customer._id);

      onArchive?.(updated);

      toast.success("Customer archived successfully.");

      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to archive customer.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);

      const updated = await restoreCustomer(customer._id);

      onRestore?.(updated);

      toast.success("Customer restored successfully.");

      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to restore customer.");
    } finally {
      setLoading(false);
    }
  };

  const copyId = async () => {
    await navigator.clipboard.writeText(customer._id);

    toast.success("Customer ID copied.");

    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative flex justify-center">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
          open
            ? "border-[#FF5A5F] bg-[#FFF3F3] text-[#FF5A5F] shadow-md"
            : "border-gray-200 bg-white text-gray-600 hover:border-[#FF5A5F] hover:bg-[#FFF7F7] hover:text-[#FF5A5F] hover:shadow-sm"
        }`}
      >
        <MoreHorizontal size={18} strokeWidth={2.3} />
      </button>

      {open && (
        <div className="absolute top-12 right-0 z-50 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
            <p className="font-semibold text-gray-900">Customer Actions</p>
            <p className="text-xs text-gray-500">Manage this customer</p>
          </div>

          <Link
            href={`/admin/customers/${customer._id}`}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-orange-50 hover:text-[#FF5A5F]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-[#FF5A5F]">
              <User size={17} />
            </div>

            <div>
              <p>View Customer</p>
              <p className="text-xs font-normal text-gray-500">Open customer profile</p>
            </div>
          </Link>

          <button
            onClick={copyId}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Copy size={17} />
            </div>

            <div>
              <p>Copy Customer ID</p>
              <p className="text-xs font-normal text-gray-500">Copy unique identifier</p>
            </div>
          </button>

          <div className="mx-4 border-t border-gray-100" />

          {customer.isArchived ? (
            <button
              disabled={loading}
              onClick={handleRestore}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-green-700 transition-colors hover:bg-green-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <ArchiveRestore size={17} />
              </div>

              <div>
                <p>Restore Customer</p>
                <p className="text-xs font-normal text-green-600/70">Make account active again</p>
              </div>
            </button>
          ) : (
            <button
              disabled={loading}
              onClick={handleArchive}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <Archive size={17} />
              </div>

              <div>
                <p>Archive Customer</p>
                <p className="text-xs font-normal text-red-600/70">
                  Hide customer from active list
                </p>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
