"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import { Archive, ExternalLink, MoreHorizontal, Pencil } from "lucide-react";

export default function ProductActionsMenu({ product, onArchive }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef(null);

  /* ================================
     CLOSE ON OUTSIDE CLICK
  ================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  /* ================================
     CLOSE ON ESCAPE
  ================================= */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleArchive = () => {
    setIsOpen(false);

    onArchive?.(product);
  };

  return (
    <div ref={menuRef} className="relative inline-block">
      {/* Trigger */}

      <button
        type="button"
        aria-label={`Actions for ${product.name}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
          isOpen
            ? "bg-[#F3F4F6] text-[#242424]"
            : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#242424]"
        }`}
      >
        <MoreHorizontal size={18} />
      </button>

      {/* Menu */}

      {isOpen && (
        <div className="absolute top-full right-0 z-30 mt-1.5 w-48 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg">
          {/* Edit */}

          <Link
            href={`/admin/products/${product._id}/edit`}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#F8F9FB]"
          >
            <Pencil size={15} className="text-[#6B7280]" />
            Edit Product
          </Link>

          {/* View */}

          {product.slug && (
            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#F8F9FB]"
            >
              <ExternalLink size={15} className="text-[#6B7280]" />
              View Product
            </Link>
          )}

          {/* Divider */}

          <div className="my-1 border-t border-[#F0F0F0]" />

          {/* Archive */}

          <button
            type="button"
            onClick={handleArchive}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
          >
            <Archive size={15} />
            Archive Product
          </button>
        </div>
      )}
    </div>
  );
}
