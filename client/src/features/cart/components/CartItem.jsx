"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartItem({ item, isUpdating, onIncrease, onDecrease, onRemove }) {
  const product = item.product;

  if (!product) return null;

  const image =
    product.images?.[0]?.url || product.images?.[0]?.secure_url || "/placeholder-product.png";

  const hasDiscount = product.comparePrice > product.price;

  const discountPercentage = hasDiscount
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div
      className={`rounded-2xl border border-[#EDE9E6] bg-white p-4 transition sm:p-5 ${
        isUpdating ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <div className="flex gap-4">
        {/* Product Image */}
        <Link
          href={`/products/${product.slug}`}
          className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#FFF9F5] sm:h-28 sm:w-28"
        >
          <img src={image} alt={product.name} className="h-full w-full object-cover" />
        </Link>

        {/* Product Information */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link
                href={`/products/${product.slug}`}
                className="line-clamp-2 text-sm leading-5 font-semibold text-[#242424] transition hover:text-[#FF5A5F] sm:text-base"
              >
                {product.name}
              </Link>

              {/* Stock */}
              {product.stock > 0 ? (
                <p className="mt-1 text-xs font-medium text-green-600">In Stock</p>
              ) : (
                <p className="mt-1 text-xs font-medium text-red-500">Out of Stock</p>
              )}
            </div>

            {/* Desktop Remove */}
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="hidden rounded-lg p-2 text-[#9CA3AF] transition hover:bg-red-50 hover:text-red-500 sm:block"
              aria-label="Remove product"
            >
              <Trash2 size={17} />
            </button>
          </div>

          {/* Price */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-lg font-bold text-[#242424]">
              ₹{product.price.toLocaleString("en-IN")}
            </span>

            {hasDiscount && (
              <>
                <span className="text-sm text-[#9CA3AF] line-through">
                  ₹{product.comparePrice.toLocaleString("en-IN")}
                </span>

                <span className="text-xs font-semibold text-green-600">
                  {discountPercentage}% off
                </span>
              </>
            )}
          </div>

          {/* Quantity + mobile remove */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center overflow-hidden rounded-xl border border-[#EDE9E6]">
              <button
                type="button"
                onClick={() => onDecrease(item)}
                disabled={isUpdating}
                className="flex h-9 w-9 items-center justify-center transition hover:bg-[#FFF9F5] disabled:opacity-40"
              >
                <Minus size={15} />
              </button>

              <span className="flex h-9 min-w-9 items-center justify-center border-x border-[#EDE9E6] px-2 text-sm font-semibold text-[#242424]">
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={() => onIncrease(item)}
                disabled={isUpdating || item.quantity >= product.stock || item.quantity >= 20}
                className="flex h-9 w-9 items-center justify-center transition hover:bg-[#FFF9F5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={15} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item)}
              className="flex items-center gap-1.5 text-xs font-medium text-red-500 sm:hidden"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Low stock */}
      {product.stock > 0 && product.stock <= 5 && (
        <p className="mt-3 text-xs font-medium text-orange-600 sm:ml-32">
          Only {product.stock} left in stock
        </p>
      )}
    </div>
  );
}
