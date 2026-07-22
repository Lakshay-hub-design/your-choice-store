import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function EmptyCart() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FF5A5F]/10">
          <ShoppingBag size={40} className="text-[#FF5A5F]" />
        </div>

        <h2 className="mt-6 text-2xl font-bold text-[#242424]">Your cart is empty</h2>

        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          Looks like you haven't added anything yet. Explore our gifts and toys and find something
          special.
        </p>

        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#f1494e]"
        >
          Continue Shopping
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
