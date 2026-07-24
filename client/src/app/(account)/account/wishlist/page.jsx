"use client";

import { useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";

import useWishlistStore from "@/store/wishlistStore";

import WishlistItemCard from "@/features/wishlist/components/WishlistItemCard";
import ClearWishlistModal from "@/features/wishlist/components/ClearWishlistModal";

export default function WishlistPage() {
  const [showClearModal, setShowClearModal] = useState(false);

  const wishlist = useWishlistStore((state) => state.wishlist);

  const isLoading = useWishlistStore((state) => state.isLoading);

  const isInitialized = useWishlistStore((state) => state.isInitialized);

  const items = wishlist?.items ?? [];

  if (!isInitialized || isLoading) {
    return <WishlistLoading />;
  }

  if (!items.length) {
    return <EmptyWishlist />;
  }

  return (
    <>
      <div>
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Heart size={21} className="text-[#FF5A5F]" />

              <h1 className="text-xl font-bold text-[#242424] sm:text-2xl">My Wishlist</h1>
            </div>

            <p className="mt-1 text-sm text-[#6B7280]">
              {items.length} {items.length === 1 ? "saved item" : "saved items"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowClearModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] transition hover:text-red-500"
          >
            <Trash2 size={14} />

            <span className="hidden sm:inline">Clear Wishlist</span>

            <span className="sm:hidden">Clear</span>
          </button>
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            if (!item.product) {
              return null;
            }

            return <WishlistItemCard key={item.product._id} item={item} />;
          })}
        </div>
      </div>

      <ClearWishlistModal open={showClearModal} onClose={() => setShowClearModal(false)} />
    </>
  );
}

function EmptyWishlist() {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-[#EDE9E6] bg-white px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FF5A5F]/10">
        <Heart size={34} className="text-[#FF5A5F]" />
      </div>

      <h2 className="mt-5 text-xl font-bold text-[#242424]">Your wishlist is empty</h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-[#6B7280]">
        Save products you love and come back to them anytime.
      </p>

      <Link
        href="/products"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#FF5A5F] px-6 text-sm font-semibold text-white transition hover:bg-[#f1494e]"
      >
        Explore Products
      </Link>
    </div>
  );
}

function WishlistLoading() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-[#EDE9E6]" />

        <div className="mt-2 h-4 w-20 animate-pulse rounded bg-[#EDE9E6]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white">
            <div className="aspect-square animate-pulse bg-[#FFF9F5]" />

            <div className="space-y-3 p-4">
              <div className="h-4 w-4/5 animate-pulse rounded bg-[#EDE9E6]" />

              <div className="h-5 w-1/3 animate-pulse rounded bg-[#EDE9E6]" />

              <div className="h-10 animate-pulse rounded-xl bg-[#EDE9E6]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
