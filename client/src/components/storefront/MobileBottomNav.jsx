"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Grid2X2, Heart, Home, ShoppingCart, UserRound } from "lucide-react";

import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";

import { selectCartCount } from "@/features/cart/selectors/cartSelectors";

const items = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Categories",
    href: "/categories",
    icon: Grid2X2,
  },
  {
    label: "Wishlist",
    href: "/account/wishlist",
    icon: Heart,
    wishlist: true,
  },
  {
    label: "Cart",
    href: "/cart",
    icon: ShoppingCart,
    cart: true,
  },
  {
    label: "Account",
    href: "/account/menu",
    icon: UserRound,
    account: true,
  },
];

function CountBadge({ count }) {
  if (!count || count <= 0) return null;

  return (
    <span className="absolute -top-2 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF5A5F] px-1 text-[8px] leading-none font-bold text-white ring-2 ring-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Cart count
  const cartCount = useCartStore(selectCartCount);

  // Wishlist count and initialization
  const wishlistCount = useWishlistStore((state) => state.wishlist?.items?.length || 0);

  const isWishlistInitialized = useWishlistStore((state) => state.isInitialized);

  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

  // Load wishlist when navigation mounts
  useEffect(() => {
    if (!isWishlistInitialized) {
      fetchWishlist();
    }
  }, [isWishlistInitialized, fetchWishlist]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[100] border-t border-[#EDE9E6] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="grid h-16 grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;

          const active = item.wishlist
            ? pathname.startsWith(item.href)
            : item.account
              ? pathname === "/account" ||
                (pathname.startsWith("/account") && !pathname.startsWith("/account/wishlist"))
              : item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                active ? "text-[#FF5A5F]" : "text-[#6B7280]"
              }`}
            >
              <span className="relative">
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />

                {item.cart && <CountBadge count={cartCount} />}

                {item.wishlist && <CountBadge count={wishlistCount} />}
              </span>

              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
