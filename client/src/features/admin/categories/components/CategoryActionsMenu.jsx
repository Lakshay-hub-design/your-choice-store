"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import { MoreHorizontal, Pencil, Archive, ArchiveRestore, Eye, Copy } from "lucide-react";

import { toast } from "sonner";

import {
  archiveCategory,
  restoreCategory,
} from "@/features/admin/categories/services/adminCategoryService";

export default function CategoryActionsMenu({ category, onArchive, onRestore }) {
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleArchive = async () => {
    try {
      setLoading(true);

      const updated = await archiveCategory(category._id);

      onArchive?.(updated);

      toast.success("Category archived successfully.");

      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to archive category.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);

      const updated = await restoreCategory(category._id);

      onRestore?.(updated);

      toast.success("Category restored successfully.");

      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to restore category.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(category._id);

    toast.success("Category ID copied.");

    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F3F4F6]"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
          {/* Edit */}

          <Link
            href={`/admin/categories/${category._id}/edit`}
            className="flex items-center gap-3 px-4 py-3 text-sm text-[#242424] transition hover:bg-[#F8F9FB]"
          >
            <Pencil size={16} />
            Edit Category
          </Link>

          {/* View Products */}

          <Link
            href={`/admin/products?category=${category._id}`}
            className="flex items-center gap-3 px-4 py-3 text-sm text-[#242424] transition hover:bg-[#F8F9FB]"
          >
            <Eye size={16} />
            View Products
          </Link>

          {/* Copy ID */}

          <button
            type="button"
            onClick={handleCopyId}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#242424] transition hover:bg-[#F8F9FB]"
          >
            <Copy size={16} />
            Copy Category ID
          </button>

          <div className="border-t border-[#F3F4F6]" />

          {/* Archive / Restore */}

          {category.isArchived ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleRestore}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-green-600 transition hover:bg-green-50 disabled:opacity-50"
            >
              <ArchiveRestore size={16} />
              Restore Category
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleArchive}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <Archive size={16} />
              Archive Category
            </button>
          )}
        </div>
      )}
    </div>
  );
}
