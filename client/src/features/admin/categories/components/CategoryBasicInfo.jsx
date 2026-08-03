"use client";

export default function CategoryBasicInfo({ values, errors, onChange }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[#F3F4F6] px-6 py-5">
        <h2 className="text-lg font-semibold text-[#111827]">Basic Information</h2>

        <p className="mt-1 text-sm text-[#6B7280]">
          Provide the essential details for your category.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6 p-6">
        {/* Category Name */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-[#374151]">
              Category Name
              <span className="ml-1 text-[#FF5A5F]">*</span>
            </label>

            <span className="text-xs text-[#9CA3AF]">Required</span>
          </div>

          <input
            type="text"
            placeholder="e.g. Toys, Gifts, Electronics"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-[#111827] shadow-sm transition outline-none ${
              errors.name
                ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                : "border-[#D1D5DB] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10"
            }`}
          />

          <p className="mt-2 text-xs text-[#6B7280]">
            This name will appear throughout your store.
          </p>

          {errors.name && <p className="mt-2 text-sm font-medium text-red-500">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-[#374151]">Description</label>

            <span className="text-xs text-[#9CA3AF]">Optional</span>
          </div>

          <textarea
            rows={5}
            placeholder="Write a short description about this category..."
            value={values.description}
            onChange={(e) => onChange("description", e.target.value)}
            className={`w-full resize-none rounded-xl border bg-white p-4 text-sm text-[#111827] shadow-sm transition outline-none ${
              errors.description
                ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                : "border-[#D1D5DB] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10"
            }`}
          />

          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-[#6B7280]">
              Help customers understand what products belong to this category.
            </p>

            <span className="text-xs text-[#9CA3AF]">{values.description.length}/500</span>
          </div>

          {errors.description && (
            <p className="mt-2 text-sm font-medium text-red-500">{errors.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
