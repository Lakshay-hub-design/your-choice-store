"use client";

import Image from "next/image";
import Link from "next/link";

import CategoryStatusToggle from "./CategoryStatusToggle";
import CategoryActionsMenu from "./CategoryActionsMenu";

export default function CategoryTable({ categories, onStatusChange, onArchive, onRestore }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA] text-left">
            <TableHeading>Category</TableHeading>

            <TableHeading>Slug</TableHeading>

            <TableHeading>Products</TableHeading>

            <TableHeading>Featured</TableHeading>

            <TableHeading>Status</TableHeading>

            <TableHeading>Display Order</TableHeading>

            <TableHeading>Actions</TableHeading>
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <CategoryRow
              key={category._id}
              category={category}
              onStatusChange={onStatusChange}
              onArchive={onArchive}
              onRestore={onRestore}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoryRow({ category, onStatusChange, onArchive, onRestore }) {
  const image =
    category.image?.url || category.image?.secure_url || "/images/category-placeholder.png";

  return (
    <tr className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA]">
      {/* Category */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FFF9F5]">
            <Image src={image} alt={category.name} fill sizes="48px" className="object-cover" />
          </div>

          <div className="min-w-0">
            <Link
              href={`/admin/categories/${category._id}/edit`}
              className="block max-w-[240px] truncate text-sm font-semibold text-[#242424] hover:text-[#FF5A5F]"
            >
              {category.name}
            </Link>

            {category.description && (
              <p className="mt-0.5 max-w-[240px] truncate text-xs text-[#9CA3AF]">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Slug */}

      <td className="px-5 py-4">
        <span className="rounded-md bg-[#F3F4F6] px-2 py-1 text-xs text-[#6B7280]">
          {category.slug}
        </span>
      </td>

      {/* Product Count */}

      <td className="px-5 py-4">
        <span className="text-sm font-semibold text-[#242424]">{category.productCount ?? 0}</span>
      </td>

      {/* Featured */}

      <td className="px-5 py-4">
        <FeaturedBadge featured={category.isFeatured} />
      </td>

      {/* Status */}

      <td className="px-5 py-4">
        <CategoryStatusToggle
          categoryId={category._id}
          isActive={category.isActive}
          onSuccess={onStatusChange}
        />
      </td>

      {/* Display Order */}

      <td className="px-5 py-4 text-sm text-[#6B7280]">{category.displayOrder}</td>

      {/* Actions */}

      <td className="px-5 py-4">
        <CategoryActionsMenu category={category} onArchive={onArchive} onRestore={onRestore} />
      </td>
    </tr>
  );
}

function FeaturedBadge({ featured }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        featured ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"
      }`}
    >
      {featured ? "Featured" : "No"}
    </span>
  );
}

function TableHeading({ children }) {
  return (
    <th className="px-5 py-3 text-xs font-semibold tracking-wide text-[#6B7280] uppercase">
      {children}
    </th>
  );
}
