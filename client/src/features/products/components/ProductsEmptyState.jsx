"use client";

import { PackageSearch } from "lucide-react";
import { useRouter } from "next/navigation";

import EmptyState from "@/components/ui/EmptyState";

export default function ProductsEmptyState({ hasFilters = false }) {
  const router = useRouter();

  return (
    <EmptyState
      icon={PackageSearch}
      title={hasFilters ? "No matching products" : "No products available"}
      description={
        hasFilters
          ? "We couldn't find products matching your current search or filters. Try changing or clearing them."
          : "There are no products available at the moment."
      }
      actionLabel={hasFilters ? "Clear Filters" : undefined}
      onAction={hasFilters ? () => router.push("/products") : undefined}
    />
  );
}
