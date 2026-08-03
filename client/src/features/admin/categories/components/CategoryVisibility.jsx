"use client";

export default function CategoryVisibility({ values, onChange }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
      <h2 className="mb-6 text-lg font-semibold text-[#111827]">Visibility</h2>

      <div className="space-y-5">
        <Switch
          label="Featured Category"
          checked={values.isFeatured}
          onChange={() => onChange("isFeatured", !values.isFeatured)}
        />

        <Switch
          label="Active"
          checked={values.isActive}
          onChange={() => onChange("isActive", !values.isActive)}
        />
      </div>
    </div>
  );
}

function Switch({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 transition hover:border-[#D1D5DB] hover:bg-white">
      <div>
        <h3 className="text-sm font-semibold text-[#111827]">{label}</h3>

        <p className="mt-0.5 text-xs text-[#6B7280]">{checked ? "Enabled" : "Disabled"}</p>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:ring-4 focus:ring-[#FF5A5F]/10 focus:outline-none ${
          checked ? "bg-[#22C55E]" : "bg-[#D1D5DB]"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
