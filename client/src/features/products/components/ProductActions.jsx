"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Heart, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";

import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";

export default function ProductActions({ product }) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);

  const [isAdding, setIsAdding] = useState(false);

  const [message, setMessage] = useState("");

  const user = useAuthStore((state) => state.user);

  const addItem = useCartStore((state) => state.addItem);

  const outOfStock = product.stock <= 0;

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(product.stock, current + 1));
  };

  const handleAddToCart = async () => {
    if (outOfStock || isAdding) {
      return;
    }

    if (!user) {
      router.push(`/login?redirect=/products/${product.slug}`);

      return;
    }

    setMessage("");
    setIsAdding(true);

    const result = await addItem(product._id, quantity);

    setIsAdding(false);

    if (!result.success) {
      setMessage(result.message || "Unable to add product.");

      return;
    }

    setMessage("Added to your cart.");
  };

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[#242424]">Quantity</p>

      <div className="flex h-11 w-fit items-center overflow-hidden rounded-xl border border-[#EDE9E6] bg-white">
        <button
          type="button"
          onClick={decreaseQuantity}
          disabled={quantity <= 1}
          className="flex h-full w-11 items-center justify-center text-[#6B7280] transition hover:bg-[#FFF9F5] disabled:opacity-30"
        >
          <Minus size={15} />
        </button>

        <span className="flex h-full min-w-11 items-center justify-center border-x border-[#EDE9E6] text-sm font-semibold text-[#242424]">
          {quantity}
        </span>

        <button
          type="button"
          onClick={increaseQuantity}
          disabled={quantity >= product.stock}
          className="flex h-full w-11 items-center justify-center text-[#6B7280] transition hover:bg-[#FFF9F5] disabled:opacity-30"
        >
          <Plus size={15} />
        </button>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          disabled={outOfStock || isAdding}
          onClick={handleAddToCart}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(255,90,95,0.18)] transition hover:bg-[#f1494e] disabled:cursor-not-allowed disabled:bg-[#D1D5DB]"
        >
          {isAdding ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart size={17} />

              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </>
          )}
        </button>

        <button
          type="button"
          aria-label="Add to wishlist"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#EDE9E6] bg-white text-[#6B7280] transition hover:border-[#FF5A5F] hover:text-[#FF5A5F]"
        >
          <Heart size={19} />
        </button>
      </div>

      {message && (
        <p
          className={`mt-2 text-xs font-medium ${
            message === "Added to your cart." ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
