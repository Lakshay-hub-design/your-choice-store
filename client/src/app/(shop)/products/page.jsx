import ProductGrid from "@/features/products/components/ProductGrid";
import ProductFilters from "@/features/products/components/ProductFilters";
import ProductSort from "@/features/products/components/ProductSort";
import MobileFilters from "@/features/products/components/MobileFilters";
import ProductPagination from "@/features/products/components/ProductPagination";

import { getProducts } from "@/features/products/services/productService";
import { getCategories } from "@/features/categories/services/categoryService";
import ProductsEmptyState from "@/features/products/components/ProductsEmptyState";

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;

  const page = Number(params.page) || 1;

  const filters = {
    page,
    limit: 12,

    category: params.category || "",

    search: params.search || "",

    sort: params.sort || "newest",

    minPrice: params.minPrice || "",

    maxPrice: params.maxPrice || "",

    inStock: params.inStock || "",

    featured: params.featured || "",

    bestSeller: params.bestSeller || "",
  };

  let products = [];
  let categories = [];
  let pagination = null;
  let hasError = false;

  try {
    const [productData, categoryData] = await Promise.all([getProducts(filters), getCategories()]);

    products = productData?.products ?? [];

    pagination = productData?.pagination ?? null;

    categories = categoryData?.categories ?? categoryData ?? [];
  } catch (error) {
    console.error("Products page error:", error);

    hasError = true;
  }

  const selectedCategory = categories.find((category) => category._id === filters.category) || null;

  const pageTitle = filters.search
    ? `Search results for "${filters.search}"`
    : selectedCategory
      ? selectedCategory.name
      : filters.bestSeller === "true"
        ? "Best Sellers"
        : "Shop All Products";

  const hasFilters = Boolean(
    filters.search ||
    filters.category ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.inStock ||
    filters.featured ||
    filters.bestSeller
  );

  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Breadcrumb */}

        <div className="mb-5 text-xs text-[#6B7280]">
          <span>Home</span>

          <span className="mx-2">/</span>

          <span className="font-medium text-[#242424]">Products</span>
        </div>

        {/* Heading */}

        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">
            {pageTitle}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
            {filters.search
              ? "Browse products matching your search."
              : selectedCategory
                ? `Explore our ${selectedCategory.name} collection.`
                : "Discover gifts, toys and thoughtful products for every special moment."}
          </p>
        </div>

        {/* Mobile toolbar */}

        <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
          <MobileFilters categories={categories} />

          <ProductSort />
        </div>

        <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
          {/* Desktop filters */}

          <aside className="hidden lg:block">
            <ProductFilters categories={categories} />
          </aside>

          {/* Products */}

          <section className="min-w-0">
            {!hasError && (
              <div className="mb-5 hidden items-center justify-between lg:flex">
                <ProductCount pagination={pagination} fallback={products.length} />

                <ProductSort />
              </div>
            )}

            {hasError ? (
              <ProductsError />
            ) : products.length === 0 ? (
              <ProductsEmptyState hasFilters={hasFilters} />
            ) : (
              <>
                <ProductGrid products={products} />

                <ProductPagination pagination={pagination} />
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function ProductCount({ pagination, fallback }) {
  const total = pagination?.totalProducts ?? pagination?.total ?? fallback;

  return (
    <p className="text-sm text-[#6B7280]">
      <span className="font-semibold text-[#242424]">{total}</span>{" "}
      {total === 1 ? "product" : "products"}
    </p>
  );
}

function ProductsError() {
  return (
    <div className="rounded-2xl border border-[#EDE9E6] bg-white px-6 py-16 text-center">
      <h2 className="text-lg font-bold text-[#242424]">Unable to load products</h2>

      <p className="mt-2 text-sm text-[#6B7280]">
        Something went wrong while loading the products. Please try again.
      </p>
    </div>
  );
}
