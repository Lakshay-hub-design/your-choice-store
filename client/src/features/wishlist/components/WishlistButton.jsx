"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";

import useAuthStore from "@/store/authStore";
import useWishlistStore from "@/store/wishlistStore";

export default function WishlistButton({
  productId,
  className = "",
  iconSize = 18,
  showText = false,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [isUpdating, setIsUpdating] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isLoading);

  const wishlistItems = useWishlistStore((state) => state.wishlist?.items);

  const addItem = useWishlistStore((state) => state.addItem);

  const removeItem = useWishlistStore((state) => state.removeItem);

  const isWishlisted =
    wishlistItems?.some((item) => {
      const id = item.product?._id ?? item.product;

      return String(id) === String(productId);
    }) ?? false;

  const handleWishlist = async (event) => {
    // Important when button is inside a clickable ProductCard.
    event.preventDefault();
    event.stopPropagation();

    if (isAuthLoading || isUpdating) {
      return;
    }

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);

      return;
    }

    setIsUpdating(true);

    try {
      if (isWishlisted) {
        await removeItem(productId);
      } else {
        await addItem(productId);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleWishlist}
      disabled={isUpdating || isAuthLoading}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`inline-flex items-center justify-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-60 ${className} `}
    >
      {isUpdating ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        <Heart size={iconSize} className={isWishlisted ? "fill-[#FF5A5F] text-[#FF5A5F]" : ""} />
      )}

      {showText && <span>{isWishlisted ? "Saved" : "Wishlist"}</span>}
    </button>
  );
}
