"use client";

import { Search, X } from "lucide-react";

import { useEffect, useState } from "react";

export default function AdminProductFilters({ filters, categories = [], onChange }) {
  const hasFilters = filters.search || filters.category || filters.status || filters.stock;

  const [search, setSearch] = useState(filters.search);

  useEffect(() => {
    setSearch(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== filters.search) {
        onChange({
          search,
        });
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, filters.search, onChange]);

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex flex-col gap-3 xl:flex-row">
        {/* Search */}

        <div className="relative min-w-0 flex-1">
          <Search size={17} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#9CA3AF]" />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products or SKU..."
            className="h-11 w-full rounded-xl border border-[#E5E7EB] pr-4 pl-10 text-sm transition outline-none focus:border-[#FF5A5F]"
          />
        </div>

        <select
          value={filters.category}
          onChange={(event) =>
            onChange({
              category: event.target.value,
            })
          }
          className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#242424] transition outline-none focus:border-[#FF5A5F]"
        >
          <option value="">All Categories</option>

          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(event) =>
            onChange({
              status: event.target.value,
            })
          }
          className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#242424] outline-none"
        >
          <option value="">All Status</option>

          <option value="active">Active</option>

          <option value="inactive">Inactive</option>
        </select>

        <select
          value={filters.stock}
          onChange={(event) =>
            onChange({
              stock: event.target.value,
            })
          }
          className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#242424] outline-none"
        >
          <option value="">All Inventory</option>

          <option value="inStock">In Stock</option>

          <option value="low">Low Stock</option>

          <option value="out">Out of Stock</option>
        </select>

        <select
          value={filters.sort}
          onChange={(event) =>
            onChange({
              sort: event.target.value,
            })
          }
          className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#242424] outline-none"
        >
          <option value="newest">Newest</option>

          <option value="oldest">Oldest</option>

          <option value="priceAsc">Price: Low to High</option>

          <option value="priceDesc">Price: High to Low</option>

          <option value="stockAsc">Stock: Low to High</option>

          <option value="stockDesc">Stock: High to Low</option>
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={() =>
              onChange({
                search: "",
                status: "",
                category: "",
                stock: "",
              })
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-4 text-sm font-medium text-[#6B7280] hover:text-[#242424]"
          >
            <X size={15} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
