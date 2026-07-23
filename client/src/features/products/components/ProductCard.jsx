"use client";

import { useState } from "react";
import Link from "next/link";

import { Heart, Loader2, ShoppingCart, Star } from "lucide-react";

import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";

import WishlistButton from "@/features/wishlist/components/WishlistButton";

import Image from "next/image";

export default function ProductCard({ product }) {
  const [isAdding, setIsAdding] = useState(false);

  const [message, setMessage] = useState("");

  const user = useAuthStore((state) => state.user);

  const addItem = useCartStore((state) => state.addItem);

  const image =
    product.images?.[0]?.url ||
    product.images?.[0]?.secure_url ||
    "/images/product-placeholder.png";

  const hasDiscount = product.comparePrice > product.price;

  const discountPercentage = hasDiscount
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const outOfStock = product.stock <= 0;

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (outOfStock || isAdding) {
      return;
    }

    if (!user) {
      // Later we can preserve the current URL
      // and redirect back after login.
      window.location.href = "/login";
      return;
    }

    setMessage("");
    setIsAdding(true);

    const result = await addItem(product._id, 1);

    setIsAdding(false);

    if (!result.success) {
      setMessage(result.message || "Unable to add product.");

      return;
    }

    setMessage("Added!");
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(36,36,36,0.08)]">
      {/* Product image */}
      <div className="relative aspect-square overflow-hidden bg-[#FFF9F5]">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <Image
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1.5">
          {product.isBestSeller && (
            <span className="rounded-full bg-[#FFC83D] px-2 py-1 text-[9px] font-bold text-[#242424] sm:text-[10px]">
              BEST SELLER
            </span>
          )}

          {hasDiscount && (
            <span className="rounded-full bg-[#FF5A5F] px-2 py-1 text-[9px] font-bold text-white sm:text-[10px]">
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          aria-label="Add to wishlist"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            // Wishlist module comes later.
          }}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#6B7280] shadow-sm transition hover:text-[#FF5A5F]"
        >
          <Heart size={16} />
        </button>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <span className="rounded-full bg-[#242424] px-3 py-1.5 text-[10px] font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Information */}
      <div className="p-3 sm:p-4">
        {product.customization?.enabled && (
          <p className="mb-1.5 text-[9px] font-semibold tracking-wide text-[#7C5CFC] uppercase sm:text-[10px]">
            Personalizable
          </p>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[40px] text-sm leading-5 font-semibold text-[#242424] transition hover:text-[#FF5A5F]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-md bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {product.averageRating?.toFixed(1)}

              <Star size={9} fill="currentColor" />
            </div>

            <span className="text-[10px] text-[#9CA3AF]">({product.numReviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-base font-bold text-[#242424] sm:text-lg">
            ₹{product.price?.toLocaleString("en-IN")}
          </span>

          {hasDiscount && (
            <span className="text-xs text-[#9CA3AF] line-through">
              ₹{product.comparePrice?.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          type="button"
          disabled={outOfStock || isAdding}
          onClick={handleAddToCart}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#FF5A5F] px-3 py-2.5 text-xs font-semibold text-[#FF5A5F] transition hover:bg-[#FF5A5F] hover:text-white disabled:cursor-not-allowed disabled:border-[#EDE9E6] disabled:bg-[#F8F8F8] disabled:text-[#9CA3AF] sm:text-sm"
        >
          {isAdding ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Adding...
            </>
          ) : outOfStock ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart size={15} />
              Add to Cart
            </>
          )}
        </button>

        {message && (
          <p
            className={`mt-2 text-center text-[10px] font-medium ${
              message === "Added!" ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </article>
  );
}
