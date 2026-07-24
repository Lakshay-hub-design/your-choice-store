import { BadgeCheck, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";

import ProductActions from "./ProductActions";

export default function ProductInfo({ product }) {
  const hasDiscount = product.comparePrice > product.price;

  const discount = hasDiscount
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const inStock = product.stock > 0;

  return (
    <div className="flex flex-col">
      {/* Category */}
      {product.category && (
        <p className="text-[10px] font-semibold tracking-[0.14em] text-[#7C5CFC] uppercase">
          {product.category.name}
        </p>
      )}

      {/* Name */}
      <h1 className="mt-2 text-2xl leading-tight font-bold tracking-tight text-[#242424] sm:text-3xl">
        {product.name}
      </h1>

      {/* Rating */}
      {product.numReviews > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white">
            {product.averageRating?.toFixed(1)}

            <Star size={11} fill="currentColor" />
          </span>

          <span className="text-xs text-[#6B7280]">
            {product.numReviews} {product.numReviews === 1 ? "review" : "reviews"}
          </span>
        </div>
      )}

      {/* Price */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <span className="text-3xl font-bold text-[#242424]">
          ₹{product.price?.toLocaleString("en-IN")}
        </span>

        {hasDiscount && (
          <>
            <span className="text-base text-[#9CA3AF] line-through">
              ₹{product.comparePrice?.toLocaleString("en-IN")}
            </span>

            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
              {discount}% OFF
            </span>
          </>
        )}
      </div>

      <p className="mt-1 text-[10px] text-[#9CA3AF]">Inclusive of all taxes</p>

      {/* Stock */}
      <div className="mt-4">
        {inStock ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
            <BadgeCheck size={16} />
            In Stock
          </span>
        ) : (
          <span className="text-sm font-semibold text-red-500">Out of Stock</span>
        )}

        {inStock && product.stock <= product.lowStockThreshold && (
          <p className="mt-1 text-xs font-medium text-orange-500">
            Only {product.stock} left in stock
          </p>
        )}
      </div>

      {/* Description */}
      {product.shortDescription && (
        <p className="mt-5 text-sm leading-6 text-[#6B7280]">{product.shortDescription}</p>
      )}

      <div className="my-6 h-px bg-[#EDE9E6]" />

      {/* Actions */}
      <ProductActions product={product} />

      {/* Benefits */}
      <div className="mt-7 grid grid-cols-2 gap-3 border-t border-[#EDE9E6] pt-6 sm:grid-cols-3">
        <Benefit icon={Truck} title="Fast Delivery" />

        <Benefit icon={ShieldCheck} title="Secure Payment" />

        <Benefit icon={RotateCcw} title="Easy Returns" />
      </div>
    </div>
  );
}

function Benefit({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FF5A5F]/10 text-[#FF5A5F]">
        <Icon size={16} />
      </div>

      <span className="text-[11px] font-medium text-[#6B7280]">{title}</span>
    </div>
  );
}
