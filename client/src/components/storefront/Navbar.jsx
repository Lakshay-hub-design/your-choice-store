"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, Menu, Search, ShoppingCart, UserRound, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";

import { selectCartCount } from "@/features/cart/selectors/cartSelectors";
import { getCategories } from "@/features/categories/services/categoryService";

import { getLoginUrl } from "@/lib/authRedirect";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);

  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useAuthStore((state) => state.user);

  const cartCount = useCartStore(selectCartCount);

  const wishlistItems = useWishlistStore((state) => state.wishlist?.items);

  const wishlistCount = wishlistItems?.length ?? 0;

  /*
   * --------------------------------------------------
   * Current category from URL
   * --------------------------------------------------
   */

  const currentCategoryId = searchParams.get("category") || "";

  const selectedCategory = categories.find((category) => category._id === currentCategoryId);

  /*
   * --------------------------------------------------
   * Sync navbar search with URL
   * --------------------------------------------------
   */

  useEffect(() => {
    if (pathname === "/products") {
      setSearch(searchParams.get("search") || "");
    } else {
      setSearch("");
    }
  }, [pathname, searchParams]);

  /*
   * --------------------------------------------------
   * Load categories
   * --------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const response = await getCategories();

        if (cancelled) return;

        const possibleData = response?.data?.data ?? response?.data ?? response;

        let categoryList = [];

        if (Array.isArray(possibleData)) {
          categoryList = possibleData;
        } else if (Array.isArray(possibleData?.categories)) {
          categoryList = possibleData.categories;
        }

        setCategories(categoryList);
      } catch (error) {
        console.error("Unable to load categories:", error);

        setCategories([]);
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * --------------------------------------------------
   * Search
   * --------------------------------------------------
   */

  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();

    const params = new URLSearchParams();

    if (query) {
      params.set("search", query);
    }

    router.push(params.toString() ? `/products?${params.toString()}` : "/products");

    setCategoryMenuOpen(false);
    setMobileMenuOpen(false);
  };

  /*
   * --------------------------------------------------
   * Category selection
   * --------------------------------------------------
   */

  const handleCategorySelect = (categoryId) => {
    const params = new URLSearchParams();

    if (categoryId) {
      params.set("category", categoryId);
    }

    /*
     * Preserve current search
     * if there is one.
     */

    const query = search.trim();

    if (query) {
      params.set("search", query);
    }

    router.push(params.toString() ? `/products?${params.toString()}` : "/products");

    setCategoryMenuOpen(false);
  };

  return (
    <>
      <header className="relative z-50 border-b border-[#EDE9E6] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* =========================
              DESKTOP
          ========================= */}

          <div className="hidden h-[78px] items-center gap-7 lg:flex">
            <Logo />

            {/* Search */}

            <form onSubmit={handleSearch} className="flex min-w-0 flex-1">
              <div className="flex w-full rounded-xl border border-[#EDE9E6] bg-white transition focus-within:border-[#FF5A5F]/50 focus-within:ring-2 focus-within:ring-[#FF5A5F]/10">
                {/* Categories */}

                <div className="relative shrink-0 border-r border-[#EDE9E6]">
                  <button
                    type="button"
                    onClick={() => setCategoryMenuOpen((current) => !current)}
                    className={`flex h-full max-w-[190px] items-center gap-2 rounded-l-xl px-4 text-xs font-medium transition ${
                      categoryMenuOpen
                        ? "bg-[#FFF9F5] text-[#FF5A5F]"
                        : "text-[#242424] hover:bg-[#FFF9F5]"
                    }`}
                  >
                    <span className="truncate">{selectedCategory?.name || "All Categories"}</span>

                    <ChevronDown
                      size={14}
                      className={`shrink-0 transition-transform duration-200 ${
                        categoryMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown */}

                  {categoryMenuOpen && (
                    <div className="absolute top-full left-0 z-[100] mt-3 w-[300px] overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white shadow-[0_18px_50px_rgba(36,36,36,0.14)]">
                      {/* Header */}
                      <div className="border-b border-[#EDE9E6] px-4 py-3">
                        <p className="text-[10px] font-bold tracking-[0.12em] text-[#9CA3AF] uppercase">
                          Shop by Category
                        </p>
                      </div>

                      {/* Categories */}
                      <div className="max-h-[360px] [scrollbar-width:thin] overflow-y-auto p-2">
                        {/* All Products */}
                        <button
                          type="button"
                          onClick={() => handleCategorySelect("")}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                            !currentCategoryId
                              ? "bg-[#FF5A5F]/10 font-semibold text-[#FF5A5F]"
                              : "font-medium text-[#242424] hover:bg-[#FFF9F5] hover:text-[#FF5A5F]"
                          }`}
                        >
                          <span>All Products</span>

                          {!currentCategoryId && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A5F]" />
                          )}
                        </button>

                        {/* Dynamic Categories */}
                        {categories.length > 0 ? (
                          categories.map((category) => {
                            const active = currentCategoryId === category._id;

                            return (
                              <button
                                key={category._id}
                                type="button"
                                onClick={() => handleCategorySelect(category._id)}
                                className={`mt-0.5 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                                  active
                                    ? "bg-[#FF5A5F]/10 font-semibold text-[#FF5A5F]"
                                    : "text-[#242424] hover:bg-[#FFF9F5] hover:text-[#FF5A5F]"
                                }`}
                              >
                                <span className="truncate">{category.name}</span>

                                {active && (
                                  <span className="ml-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5A5F]" />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-3 py-6 text-center">
                            <p className="text-xs text-[#9CA3AF]">No categories available</p>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-[#EDE9E6] bg-[#FFF9F5]/60 p-2">
                        <button
                          type="button"
                          onClick={() => {
                            router.push("/products");
                            setCategoryMenuOpen(false);
                          }}
                          className="w-full rounded-xl px-3 py-2 text-center text-xs font-semibold text-[#FF5A5F] transition hover:bg-[#FF5A5F]/10"
                        >
                          View All Products
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Search input */}

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search for gifts, toys and more..."
                  className="min-w-0 flex-1 px-4 py-3 text-sm text-[#242424] outline-none placeholder:text-[#9CA3AF]"
                />

                <button
                  type="submit"
                  className="flex w-14 shrink-0 items-center justify-center rounded-r-xl bg-[#FF5A5F] text-white transition hover:bg-[#f1494e]"
                  aria-label="Search"
                >
                  <Search size={19} />
                </button>
              </div>
            </form>

            {/* Right side */}

            <div className="flex items-center gap-6">
              <WishlistLink wishlistCount={wishlistCount} user={user} />

              <CartLink cartCount={cartCount} user={user} />

              <NavIcon
                href={user ? "/account" : "/login"}
                icon={<UserRound size={21} />}
                label={user ? "Account" : "Login"}
              />
            </div>
          </div>

          {/* =========================
              MOBILE TOP BAR
          ========================= */}

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
              <Link
                href={user ? "/account/wishlist" : getLoginUrl("/account/wishlist")}
                className="relative"
                aria-label="Wishlist"
              >
                <Heart size={21} />

                {user && wishlistCount > 0 && <CountBadge count={wishlistCount} />}
              </Link>

              <Link
                href={user ? "/cart" : getLoginUrl("/cart")}
                className="relative"
                aria-label="Cart"
              >
                <ShoppingCart size={22} />

                {user && cartCount > 0 && <CountBadge count={cartCount} />}
              </Link>
            </div>
          </div>

          {/* =========================
              MOBILE SEARCH
          ========================= */}

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
                aria-label="Search"
                className="flex w-12 shrink-0 items-center justify-center bg-[#FF5A5F] text-white"
              >
                <Search size={17} />
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* =========================
          MOBILE MENU
      ========================= */}

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={categories}
      />
    </>
  );
}

/*
 * ==================================================
 * Logo
 * ==================================================
 */

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

/*
 * ==================================================
 * Navbar icon
 * ==================================================
 */

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

/*
 * ==================================================
 * Wishlist
 * ==================================================
 */

function WishlistLink({ wishlistCount, user }) {
  const href = user ? "/account/wishlist" : getLoginUrl("/account/wishlist");

  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-sm font-medium text-[#242424] transition hover:text-[#FF5A5F]"
    >
      <span className="relative">
        <Heart size={21} />

        {user && wishlistCount > 0 && <CountBadge count={wishlistCount} />}
      </span>
      Wishlist
    </Link>
  );
}

/*
 * ==================================================
 * Cart
 * ==================================================
 */

function CartLink({ cartCount, user }) {
  const href = user ? "/cart" : getLoginUrl("/cart");

  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-sm font-medium text-[#242424] transition hover:text-[#FF5A5F]"
    >
      <span className="relative">
        <ShoppingCart size={22} />

        {user && cartCount > 0 && <CountBadge count={cartCount} />}
      </span>
      Cart
    </Link>
  );
}

/*
 * ==================================================
 * Badge
 * ==================================================
 */

function CountBadge({ count }) {
  return (
    <span className="absolute -top-2 -right-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#FF5A5F] px-1 text-[9px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/*
 * ==================================================
 * Mobile menu
 * ==================================================
 */

function MobileMenu({ open, onClose, categories }) {
  if (!open) return null;

  const links = [
    ["Home", "/"],

    ["All Products", "/products"],

    ["Best Sellers", "/products?bestSeller=true"],

    ["New Arrivals", "/products?sort=newest"],
  ];

  return (
    <div className="fixed inset-0 z-[200] lg:hidden">
      {/* Overlay */}

      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Drawer */}

      <div className="relative h-full w-[82%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <Logo />

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-[#FFF9F5]"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-8">
          {/* Main links */}

          <div className="space-y-1">
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
          </div>

          {/* Categories */}

          <div className="mt-7 border-t border-[#EDE9E6] pt-6">
            <p className="px-4 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase">
              Shop by Category
            </p>

            <div className="mt-2 space-y-1">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category._id}
                    href={`/products?category=${category._id}`}
                    onClick={onClose}
                    className="block rounded-xl px-4 py-3 text-sm text-[#242424] transition hover:bg-[#FF5A5F]/10 hover:text-[#FF5A5F]"
                  >
                    {category.name}
                  </Link>
                ))
              ) : (
                <p className="px-4 py-3 text-xs text-[#9CA3AF]">No categories available</p>
              )}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
