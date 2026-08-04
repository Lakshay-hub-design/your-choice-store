"use client";

import { Search, RotateCcw } from "lucide-react";

export default function CustomerFilters({ filters, onChange }) {
  const updateFilter = (key, value) => {
    onChange((current) => ({
      ...current,
      page: 1,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    onChange({
      page: 1,
      limit: filters.limit,

      search: "",

      status: "",

      archived: "false",

      sort: "newest",
    });
  };

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#F3F4F6] px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">Filters</h2>

          <p className="mt-1 text-sm text-[#6B7280]">
            Search and filter customers by status, archive state, and sorting.
          </p>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] transition hover:bg-[#F9FAFB]"
        >
          <RotateCcw size={15} />
          Reset Filters
        </button>
      </div>

      {/* Filters */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
          {/* Search */}
          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#374151]">Search</label>

            <div className="relative">
              <Search
                size={18}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-[#9CA3AF]"
              />

              <input
                type="text"
                placeholder="Search by customer name or email..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white pr-4 pl-10 text-sm text-[#111827] shadow-sm transition outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">Status</label>

            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm text-[#111827] shadow-sm transition outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Archive */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">Archive</label>

            <select
              value={filters.archived}
              onChange={(e) => updateFilter("archived", e.target.value)}
              className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm text-[#111827] shadow-sm transition outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10"
            >
              <option value="false">Active Customers</option>
              <option value="true">Archived Customers</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">Sort By</label>

            <select
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm text-[#111827] shadow-sm transition outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="nameAsc">Name (A-Z)</option>
              <option value="nameDesc">Name (Z-A)</option>
              <option value="lastLogin">Last Login</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
