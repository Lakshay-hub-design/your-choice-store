"use client";

import Image from "next/image";
import Link from "next/link";

import ProductActionsMenu from "@/features/admin/products/components/ProductActionsMenu";

import ProductStatusToggle from "@/features/admin/products/components/ProductStatusToggle";

export default function AdminProductTable({ products, onStatusChange, onArchive }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA] text-left">
            <TableHeading>Product</TableHeading>

            <TableHeading>Category</TableHeading>

            <TableHeading>Price</TableHeading>

            <TableHeading>Stock</TableHeading>

            <TableHeading>Status</TableHeading>

            <TableHeading>Sold</TableHeading>

            <TableHeading>Actions</TableHeading>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <ProductRow
              key={product._id}
              product={product}
              onStatusChange={onStatusChange}
              onArchive={onArchive}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductRow({ product, onStatusChange, onArchive }) {
  const image =
    product.images?.[0]?.url ||
    product.images?.[0]?.secure_url ||
    "/images/product-placeholder.png";

  return (
    <tr className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA]">
      {/* Product */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FFF9F5]">
            <Image src={image} alt={product.name} fill sizes="48px" className="object-cover" />
          </div>

          <div className="min-w-0">
            <Link
              href={`/admin/products/${product._id}/edit`}
              className="block max-w-[250px] truncate text-sm font-semibold text-[#242424] hover:text-[#FF5A5F]"
            >
              {product.name}
            </Link>

            <p className="mt-0.5 text-xs text-[#9CA3AF]">SKU: {product.sku || "—"}</p>
          </div>
        </div>
      </td>

      {/* Category */}

      <td className="px-5 py-4 text-sm text-[#6B7280]">{product.category?.name || "—"}</td>

      {/* Price */}

      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-[#242424]">
          ₹{product.price?.toLocaleString("en-IN")}
        </p>

        {product.comparePrice > product.price && (
          <p className="text-xs text-[#9CA3AF] line-through">
            ₹{product.comparePrice?.toLocaleString("en-IN")}
          </p>
        )}
      </td>

      {/* Stock */}

      <td className="px-5 py-4">
        <StockBadge stock={product.stock} />
      </td>

      {/* Status */}

      <td className="px-5 py-4">
        <ProductStatusToggle
          productId={product._id}
          isActive={product.isActive}
          onStatusChange={onStatusChange}
        />
      </td>

      {/* Sold */}

      <td className="px-5 py-4 text-sm text-[#6B7280]">{product.sold || 0}</td>

      {/* Actions */}

      <td className="px-5 py-4">
        <ProductActionsMenu product={product} onArchive={onArchive} />
      </td>
    </tr>
  );
}

function StockBadge({ stock = 0 }) {
  if (stock <= 0) {
    return (
      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
        Out of stock
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
        {stock} left
      </span>
    );
  }

  return <span className="text-sm font-medium text-[#242424]">{stock}</span>;
}

function TableHeading({ children }) {
  return (
    <th className="px-5 py-3 text-xs font-semibold tracking-wide text-[#6B7280] uppercase">
      {children}
    </th>
  );
}
