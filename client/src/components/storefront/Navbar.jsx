"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingCart, UserRound, X } from "lucide-react";

import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";

import { selectCartCount } from "@/features/cart/selectors/cartSelectors";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [search, setSearch] = useState("");

  const user = useAuthStore((state) => state.user);

  const cartCount = useCartStore(selectCartCount);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) return;

    // We'll connect this when the
    // products/search page is built.
    console.log("Search:", query);
  };

  return (
    <>
      <header className="border-b border-[#EDE9E6] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Desktop */}
          <div className="hidden h-[78px] items-center gap-7 lg:flex">
            <Logo />

            <form onSubmit={handleSearch} className="flex min-w-0 flex-1">
              <div className="flex w-full overflow-hidden rounded-xl border border-[#EDE9E6] bg-white transition focus-within:border-[#FF5A5F]/50 focus-within:ring-2 focus-within:ring-[#FF5A5F]/10">
                <button
                  type="button"
                  className="border-r border-[#EDE9E6] px-4 text-xs font-medium text-[#242424]"
                >
                  All Categories
                </button>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search for gifts, toys and more..."
                  className="min-w-0 flex-1 px-4 py-3 text-sm text-[#242424] outline-none placeholder:text-[#9CA3AF]"
                />

                <button
                  type="submit"
                  className="flex w-14 items-center justify-center bg-[#FF5A5F] text-white transition hover:bg-[#f1494e]"
                  aria-label="Search"
                >
                  <Search size={19} />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-6">
              <NavIcon href="/wishlist" icon={<Heart size={21} />} label="Wishlist" />

              <CartLink cartCount={cartCount} />

              <NavIcon
                href={user ? "/account" : "/login"}
                icon={<UserRound size={21} />}
                label={user ? "Account" : "Login"}
              />
            </div>
          </div>

          {/* Mobile */}
          <div className="flex h-[68px] items-center justify-between lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-1 text-[#242424]"
            >
              <Menu size={23} />
            </button>

            <Logo compact />

            <div className="flex items-center gap-4">
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart size={21} />
              </Link>

              <Link href="/cart" className="relative" aria-label="Cart">
                <ShoppingCart size={22} />

                {cartCount > 0 && <CartBadge count={cartCount} />}
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="pb-3 lg:hidden">
            <div className="flex overflow-hidden rounded-xl border border-[#EDE9E6] bg-white">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search for gifts, toys and more..."
                className="min-w-0 flex-1 px-4 py-3 text-xs outline-none placeholder:text-[#9CA3AF]"
              />

              <button
                type="submit"
                className="flex w-12 items-center justify-center bg-[#FF5A5F] text-white"
              >
                <Search size={17} />
              </button>
            </div>
          </form>
        </div>
      </header>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}

function Logo({ compact = false }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5A5F]/10 text-xl">
        🎁
      </div>

      <div>
        <div className={`font-extrabold tracking-tight ${compact ? "text-sm" : "text-lg"}`}>
          <span className="text-[#FF5A5F]">YC</span>{" "}
          <span className="text-[#242424]">GIFTS & TOYS</span>
        </div>

        {!compact && <p className="text-[10px] text-[#6B7280]">Gifts that create smiles ❤️</p>}
      </div>
    </Link>
  );
}

function NavIcon({ href, icon, label }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-sm font-medium text-[#242424] transition hover:text-[#FF5A5F]"
    >
      {icon}
      {label}
    </Link>
  );
}

function CartLink({ cartCount }) {
  return (
    <Link
      href="/cart"
      className="flex items-center gap-2 text-sm font-medium text-[#242424] transition hover:text-[#FF5A5F]"
    >
      <span className="relative">
        <ShoppingCart size={22} />

        {cartCount > 0 && <CartBadge count={cartCount} />}
      </span>
      Cart
    </Link>
  );
}

function CartBadge({ count }) {
  return (
    <span className="absolute -top-2 -right-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#FF5A5F] px-1 text-[9px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function MobileMenu({ open, onClose }) {
  if (!open) return null;

  const links = [
    ["Home", "/"],
    ["Gifts", "/products?type=gifts"],
    ["Toys", "/products?type=toys"],
    ["Personalized Gifts", "/products?type=personalized"],
    ["Best Sellers", "/products?sort=best"],
    ["New Arrivals", "/products?sort=new"],
    ["Offers", "/products?offers=true"],
  ];

  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div className="relative h-full w-[82%] max-w-sm bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <Logo />

          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-[#FFF9F5]">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-8 space-y-1">
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-[#242424] transition hover:bg-[#FF5A5F]/10 hover:text-[#FF5A5F]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
