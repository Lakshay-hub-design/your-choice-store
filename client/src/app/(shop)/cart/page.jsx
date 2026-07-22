"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { ShoppingBag, Trash2 } from "lucide-react";

import useCartStore from "@/store/cartStore";

import {
  selectCartCount,
  selectCartItems,
  selectCartSavings,
  selectCartSubtotal,
} from "@/features/cart/selectors/cartSelectors";

import CartItem from "@/features/cart/components/CartItem";
import CartSummary from "@/features/cart/components/CartSummary";
import EmptyCart from "@/features/cart/components/EmptyCart";
import CartSkeleton from "@/features/cart/components/CartSkeleton";
import RemoveCartItemModal from "@/features/cart/components/RemoveCartItemModal";

export default function CartPage() {
  const router = useRouter();

  const items = useCartStore(selectCartItems);

  const itemCount = useCartStore(selectCartCount);

  const subtotal = useCartStore(selectCartSubtotal);

  const savings = useCartStore(selectCartSavings);

  const isLoading = useCartStore((state) => state.isLoading);

  const isInitialized = useCartStore((state) => state.isInitialized);

  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const removeItem = useCartStore((state) => state.removeItem);

  const clearAllItems = useCartStore((state) => state.clearAllItems);

  const [updatingProductId, setUpdatingProductId] = useState(null);

  const [itemToRemove, setItemToRemove] = useState(null);

  const [isRemoving, setIsRemoving] = useState(false);

  const [isClearing, setIsClearing] = useState(false);

  const [error, setError] = useState("");

  /* ================================
     QUANTITY
  ================================= */

  const changeQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) {
      setItemToRemove(item);
      return;
    }

    setError("");
    setUpdatingProductId(item.product._id);

    const result = await updateQuantity(item.product._id, newQuantity);

    setUpdatingProductId(null);

    if (!result.success) {
      setError(result.message);
    }
  };

  const handleIncrease = (item) => {
    changeQuantity(item, item.quantity + 1);
  };

  const handleDecrease = (item) => {
    changeQuantity(item, item.quantity - 1);
  };

  /* ================================
     REMOVE
  ================================= */

  const handleConfirmRemove = async () => {
    if (!itemToRemove?.product?._id) {
      return;
    }

    setError("");
    setIsRemoving(true);

    const result = await removeItem(itemToRemove.product._id);

    setIsRemoving(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setItemToRemove(null);
  };

  /* ================================
     CLEAR CART
  ================================= */

  const handleClearCart = async () => {
    setError("");
    setIsClearing(true);

    const result = await clearAllItems();

    setIsClearing(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  /* ================================
     LOADING
  ================================= */

  if (!isInitialized || isLoading) {
    return (
      <section className="min-h-screen bg-[#FFF9F5]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <CartSkeleton />
        </div>
      </section>
    );
  }

  /* ================================
     EMPTY
  ================================= */

  if (!items.length) {
    return (
      <main className="min-h-screen bg-[#FFF9F5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <EmptyCart />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF9F5]">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag size={23} className="text-[#FF5A5F]" />

              <h1 className="text-2xl font-bold text-[#242424] sm:text-3xl">Shopping Cart</h1>
            </div>

            <p className="mt-2 text-sm text-[#6B7280]">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <button
            type="button"
            disabled={isClearing}
            onClick={handleClearCart}
            className="hidden items-center gap-2 text-sm font-medium text-red-500 transition hover:text-red-600 disabled:opacity-50 sm:flex"
          >
            <Trash2 size={15} />

            {isClearing ? "Clearing..." : "Clear Cart"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.product._id}
                item={item}
                isUpdating={updatingProductId === item.product._id}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={setItemToRemove}
              />
            ))}

            {/* Mobile clear */}
            <button
              type="button"
              disabled={isClearing}
              onClick={handleClearCart}
              className="flex items-center gap-2 px-1 text-sm font-medium text-red-500 sm:hidden"
            >
              <Trash2 size={15} />

              {isClearing ? "Clearing cart..." : "Clear Cart"}
            </button>
          </div>

          {/* Summary */}
          <CartSummary
            subtotal={subtotal}
            savings={savings}
            itemCount={itemCount}
            onCheckout={() => router.push("/checkout")}
          />
        </div>
      </div>

      {/* Remove Modal */}
      <RemoveCartItemModal
        item={itemToRemove}
        isRemoving={isRemoving}
        onClose={() => {
          if (!isRemoving) {
            setItemToRemove(null);
          }
        }}
        onConfirm={handleConfirmRemove}
      />
    </main>
  );
}
