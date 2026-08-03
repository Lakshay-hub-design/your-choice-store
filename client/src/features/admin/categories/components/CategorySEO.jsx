"use client";

export default function CategorySEO({ values, onChange }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[#F3F4F6] px-6 py-5">
        <h2 className="text-lg font-semibold text-[#111827]">SEO Settings</h2>

        <p className="mt-1 text-sm text-[#6B7280]">
          Optimize this category for search engines and improve discoverability.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6 p-6">
        {/* Meta Title */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-[#374151]">Meta Title</label>

            <span className="text-xs text-[#9CA3AF]">{values.seo.metaTitle.length}/60</span>
          </div>

          <input
            type="text"
            placeholder="Enter SEO title"
            value={values.seo.metaTitle}
            onChange={(e) => onChange("seo.metaTitle", e.target.value)}
            className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] shadow-sm transition outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10"
          />

          <p className="mt-2 text-xs text-[#6B7280]">Recommended length: 50–60 characters.</p>
        </div>

        {/* Meta Description */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-[#374151]">Meta Description</label>

            <span className="text-xs text-[#9CA3AF]">{values.seo.metaDescription.length}/160</span>
          </div>

          <textarea
            rows={4}
            placeholder="Write a concise description for search engines..."
            value={values.seo.metaDescription}
            onChange={(e) => onChange("seo.metaDescription", e.target.value)}
            className="w-full resize-none rounded-xl border border-[#D1D5DB] bg-white p-4 text-sm text-[#111827] shadow-sm transition outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10"
          />

          <p className="mt-2 text-xs text-[#6B7280]">Recommended length: 140–160 characters.</p>
        </div>

        {/* Keywords */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#374151]">Keywords</label>

          <input
            type="text"
            placeholder="gift, toys, rakhi, birthday, kids"
            value={values.seo.keywords}
            onChange={(e) => onChange("seo.keywords", e.target.value)}
            className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] shadow-sm transition outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10"
          />

          <p className="mt-2 text-xs text-[#6B7280]">
            Separate keywords with commas. Avoid repeating the same keyword multiple times.
          </p>
        </div>
      </div>
    </div>
  );
}
