import Link from "next/link";

import {
  Gift,
  HeartHandshake,
  Home,
  PartyPopper,
  Percent,
  Sparkles,
  Star,
  ToyBrick,
} from "lucide-react";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Gifts",
    href: "/products?type=gift",
    icon: Gift,
  },
  {
    label: "Toys",
    href: "/products?type=toy",
    icon: ToyBrick,
  },
  // {
  //   label: "Personalized Gifts",
  //   href: "/products?personalized=true",
  //   icon: HeartHandshake,
  // },
  {
    label: "Shop All",
    href: "/products",
    icon: PartyPopper,
  },
  {
    label: "Best Sellers",
    href: "/products?sort=best_selling",
    icon: Star,
  },
  {
    label: "New Arrivals",
    href: "/products?sort=newest",
    icon: Sparkles,
  },
  {
    label: "Offers",
    href: "/products?offers=true",
    icon: Percent,
  },
];

export default function DesktopNav() {
  return (
    <nav className="hidden border-b border-[#EDE9E6] bg-white lg:block">
      <div className="mx-auto flex min-h-12 max-w-7xl items-center justify-center gap-7 px-6">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex h-12 shrink-0 items-center gap-1.5 border-b-2 border-transparent text-xs font-medium text-[#242424] transition-colors hover:border-[#FF5A5F] hover:text-[#FF5A5F]"
            >
              <Icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
