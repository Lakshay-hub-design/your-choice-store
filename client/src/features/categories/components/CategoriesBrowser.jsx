"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Gift, Search, Sparkles } from "lucide-react";

function getParentId(category) {
  const parent = category.parentCategory;

  if (!parent) return null;

  return typeof parent === "object" ? parent._id : parent;
}

function getCategoryImage(category) {
  return category.image?.url || category.image?.secure_url || category.image?.secureUrl || "";
}

function CategoryCard({ category, subcategories = [] }) {
  const image = getCategoryImage(category);

  return (
    <div className="group overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <Link href={`/products?category=${encodeURIComponent(category._id)}`} className="block">
        <div className="relative aspect-[5/3] overflow-hidden bg-[#FFF0ED]">
          {image ? (
            <img
              src={image}
              alt={category.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFF0ED] to-[#F3EAFE]">
              <Gift size={42} strokeWidth={1.3} className="text-[#FF5A5F]" />
            </div>
          )}

          {category.isFeatured && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#FF5A5F] shadow-sm">
              <Sparkles size={11} />
              Featured
            </span>
          )}
        </div>
      </Link>

      <div className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/products?category=${encodeURIComponent(category._id)}`}
              className="line-clamp-1 text-sm font-bold text-[#242424] transition hover:text-[#FF5A5F] sm:text-base"
            >
              {category.name}
            </Link>

            {category.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#8B817D]">
                {category.description}
              </p>
            )}

            {typeof category.productCount === "number" && (
              <p className="mt-2 text-[11px] text-[#9CA3AF]">
                {category.productCount} {category.productCount === 1 ? "product" : "products"}
              </p>
            )}
          </div>

          <Link
            href={`/products?category=${encodeURIComponent(category._id)}`}
            aria-label={`Browse ${category.name}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF0ED] text-[#FF5A5F] transition group-hover:bg-[#FF5A5F] group-hover:text-white"
          >
            <ArrowRight size={16} />
          </Link>
        </div>

        {subcategories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-[#F1ECE9] pt-3">
            {subcategories.map((subcategory) => (
              <Link
                key={subcategory._id}
                href={`/products?category=${encodeURIComponent(subcategory._id)}`}
                className="rounded-full border border-[#EDE9E6] px-2.5 py-1.5 text-[10px] font-medium text-[#6B7280] transition hover:border-[#FF5A5F] hover:text-[#FF5A5F]"
              >
                {subcategory.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CategoriesBrowser({ categories }) {
  const [search, setSearch] = useState("");

  const { rootCategories, featuredCategories, searchResults } = useMemo(() => {
    const roots = categories.filter((category) => !getParentId(category));

    const featured = categories.filter((category) => category.isFeatured);

    const normalizedSearch = search.trim().toLowerCase();

    const results = normalizedSearch
      ? categories.filter((category) =>
          `${category.name} ${category.description || ""}`.toLowerCase().includes(normalizedSearch)
        )
      : [];

    return {
      rootCategories: roots.length > 0 ? roots : categories,
      featuredCategories: featured,
      searchResults: results,
    };
  }, [categories, search]);

  const isSearching = search.trim().length > 0;

  return (
    <div>
      {/* Search */}
      <div className="mb-7">
        <div className="relative max-w-xl">
          <Search size={19} className="absolute top-1/2 left-4 -translate-y-1/2 text-[#9CA3AF]" />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-xl border border-[#EDE9E6] bg-white py-3.5 pr-4 pl-11 text-sm text-[#242424] transition outline-none placeholder:text-[#A8A09C] focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/10"
          />
        </div>
      </div>

      {/* Featured Categories */}
      {!isSearching && featuredCategories.length > 0 && (
        <section className="mb-9">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-[#FF5A5F]" />
            <h2 className="text-lg font-bold text-[#242424]">Featured Categories</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featuredCategories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        </section>
      )}

      {/* All Categories / Search Results */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#242424]">
            {isSearching ? "Search Results" : "All Categories"}
          </h2>

          <span className="text-xs text-[#8B817D]">
            {isSearching ? `${searchResults.length} found` : `${categories.length} categories`}
          </span>
        </div>

        {isSearching ? (
          searchResults.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {searchResults.map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#EDE9E6] bg-white px-5 py-12 text-center">
              <Search size={30} className="mx-auto text-[#C4BDB9]" />
              <h3 className="mt-3 font-semibold text-[#242424]">No categories found</h3>
              <p className="mt-1 text-sm text-[#8B817D]">
                Try searching with a different category name.
              </p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {rootCategories
              .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
              .map((category) => {
                const children = categories.filter((item) => getParentId(item) === category._id);

                return (
                  <CategoryCard key={category._id} category={category} subcategories={children} />
                );
              })}
          </div>
        )}
      </section>
    </div>
  );
}
