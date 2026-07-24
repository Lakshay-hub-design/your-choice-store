"use client";

import { useState } from "react";
import Link from "next/link";

import { Loader2, ShoppingCart, Trash2 } from "lucide-react";

import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";

export default function WishlistItemCard({ item }) {
  const product = item.product;

  const [isAdding, setIsAdding] = useState(false);

  const [isRemoving, setIsRemoving] = useState(false);

  const [error, setError] = useState("");

  const addItem = useCartStore((state) => state.addItem);

  const removeItem = useWishlistStore((state) => state.removeItem);

  const outOfStock = !product.isActive || product.stock <= 0;

  const image =
    product.images?.[0]?.url ||
    product.images?.[0]?.secure_url ||
    "/images/product-placeholder.png";

  const hasDiscount = product.comparePrice > product.price;

  const discount = hasDiscount
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (outOfStock || isAdding) {
      return;
    }

    setError("");
    setIsAdding(true);

    try {
      const result = await addItem(product._id, 1);

      if (!result.success) {
        setError(result.message || "Unable to add to cart.");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async () => {
    if (isRemoving) {
      return;
    }

    setError("");
    setIsRemoving(true);

    try {
      const result = await removeItem(product._id);

      if (!result.success) {
        setError(result.message || "Unable to remove item.");

        setIsRemoving(false);
      }

      // If successful, this component
      // disappears automatically because
      // Zustand updates the wishlist.
    } catch {
      setError("Unable to remove item.");

      setIsRemoving(false);
    }
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white transition hover:shadow-[0_8px_30px_rgba(36,36,36,0.07)]">
      {/* Image */}
      <div className="relative">
        <Link
          href={`/products/${product.slug}`}
          className="block aspect-square overflow-hidden bg-[#FFF9F5]"
        >
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        {/* Remove */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={isRemoving}
          aria-label="Remove from wishlist"
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#EDE9E6] bg-white text-[#6B7280] shadow-sm transition hover:border-red-200 hover:text-red-500 disabled:opacity-60"
        >
          {isRemoving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>

        {outOfStock && (
          <div className="absolute bottom-3 left-3 rounded-full bg-[#242424]/90 px-2.5 py-1 text-[10px] font-semibold text-white">
            Out of Stock
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h2 className="line-clamp-2 min-h-[40px] text-sm leading-5 font-semibold text-[#242424] transition hover:text-[#FF5A5F]">
            {product.name}
          </h2>
        </Link>

        {/* Price */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold text-[#242424]">
            ₹{product.price?.toLocaleString("en-IN")}
          </span>

          {hasDiscount && (
            <>
              <span className="text-xs text-[#9CA3AF] line-through">
                ₹{product.comparePrice?.toLocaleString("en-IN")}
              </span>

              <span className="text-[10px] font-semibold text-green-600">{discount}% OFF</span>
            </>
          )}
        </div>

        {/* Add to cart */}
        <button
          type="button"
          disabled={outOfStock || isAdding}
          onClick={handleAddToCart}
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-3 text-xs font-semibold text-white transition hover:bg-[#f1494e] disabled:cursor-not-allowed disabled:bg-[#D1D5DB]"
        >
          {isAdding ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart size={15} />

              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </>
          )}
        </button>

        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
    </article>
  );
}
