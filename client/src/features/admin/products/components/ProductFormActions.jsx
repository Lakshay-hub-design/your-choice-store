import { Loader2, PackagePlus, Save } from "lucide-react";

export default function ProductFormActions({ mode, isSubmitting, isLoadingCategories, onCancel }) {
  const isEdit = mode === "edit";

  return (
    <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] pt-6 sm:flex-row sm:justify-end">
      <button
        type="button"
        disabled={isSubmitting}
        onClick={onCancel}
        className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#6B7280] transition hover:bg-[#F8F9FB] disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={isSubmitting || isLoadingCategories}
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-7 text-sm font-semibold text-white transition hover:bg-[#f1494e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />

            {isEdit ? "Saving..." : "Creating..."}
          </>
        ) : (
          <>
            {isEdit ? <Save size={16} /> : <PackagePlus size={16} />}

            {isEdit ? "Save Changes" : "Create Product"}
          </>
        )}
      </button>
    </div>
  );
}
