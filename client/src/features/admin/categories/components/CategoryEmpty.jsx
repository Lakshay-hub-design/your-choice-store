import { FolderTree, Plus } from "lucide-react";

import Link from "next/link";

export default function CategoryEmpty() {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF5A5F]/10">
        <FolderTree size={28} className="text-[#FF5A5F]" />
      </div>

      <h2 className="mt-5 text-xl font-bold text-[#242424]">No Categories Found</h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
        Create your first category to organize products in your store.
      </p>

      <Link
        href="/admin/categories/new"
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#FF5A5F] px-5 text-sm font-semibold text-white transition hover:bg-[#F1494E]"
      >
        <Plus size={17} />
        Add Category
      </Link>
    </div>
  );
}
