"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Grid2X2, Heart, Home, ShoppingCart, UserRound } from "lucide-react";

import useCartStore from "@/store/cartStore";
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
  },
  {
    label: "Cart",
    href: "/cart",
    icon: ShoppingCart,
    cart: true,
  },
  {
    label: "Account",
    href: "/account",
    icon: UserRound,
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  const cartCount = useCartStore(selectCartCount);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#EDE9E6] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="grid h-16 grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;

          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium ${
                active ? "text-[#FF5A5F]" : "text-[#6B7280]"
              }`}
            >
              <span className="relative">
                <Icon size={20} />

                {item.cart && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF5A5F] px-1 text-[8px] font-bold text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </span>

              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
