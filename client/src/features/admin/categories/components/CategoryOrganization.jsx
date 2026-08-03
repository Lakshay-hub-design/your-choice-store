"use client";

export default function CategoryOrganization({ values, categories, currentCategoryId, onChange }) {
  const availableCategories = categories.filter((category) => category._id !== currentCategoryId);

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[#F3F4F6] px-6 py-5">
        <h2 className="text-lg font-semibold text-[#111827]">Organization</h2>

        <p className="mt-1 text-sm text-[#6B7280]">
          Define where this category belongs and how it should be displayed.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6 p-6">
        {/* Parent Category */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#374151]">Parent Category</label>

          <select
            value={values.parentCategory}
            onChange={(e) => onChange("parentCategory", e.target.value)}
            className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] shadow-sm transition outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10"
          >
            <option value="">No Parent Category</option>

            {availableCategories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs text-[#6B7280]">Leave empty to create a top-level category.</p>
        </div>

        {/* Display Order */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-[#374151]">Display Order</label>

            <span className="text-xs text-[#9CA3AF]">Lower numbers appear first</span>
          </div>

          <input
            type="number"
            min={0}
            placeholder="0"
            value={values.displayOrder}
            onChange={(e) => onChange("displayOrder", e.target.value)}
            className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] shadow-sm transition outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10"
          />

          <p className="mt-2 text-xs text-[#6B7280]">
            Categories with a lower display order will appear before those with higher values.
          </p>
        </div>
      </div>
    </div>
  );
}
