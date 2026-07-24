import ProductGrid from "@/features/products/components/ProductGrid";
import ProductFilters from "@/features/products/components/ProductFilters";
import ProductSort from "@/features/products/components/ProductSort";
import MobileFilters from "@/features/products/components/MobileFilters";
import ProductPagination from "@/features/products/components/ProductPagination";

import { getProducts } from "@/features/products/services/productService";
import { getCategories } from "@/features/categories/services/categoryService";

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
  };

  let products = [];
  let categories = [];
  let pagination = null;

  try {
    const [productData, categoryData] = await Promise.all([getProducts(filters), getCategories()]);

    products = productData?.products ?? [];

    pagination = productData?.pagination ?? null;

    categories = categoryData?.categories ?? categoryData ?? [];
  } catch (error) {
    console.error("Products page error:", error);
  }

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
            Shop All Products
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
            Discover gifts, toys and thoughtful products for every special moment.
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
            <div className="mb-5 hidden items-center justify-between lg:flex">
              <ProductCount pagination={pagination} fallback={products.length} />

              <ProductSort />
            </div>

            <ProductGrid products={products} />

            <ProductPagination pagination={pagination} />
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
