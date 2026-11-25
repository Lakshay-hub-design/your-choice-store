import { getCategories } from "@/features/categories/services/categoryService";
import CategoriesBrowser from "@/features/categories/components/CategoriesBrowser";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories = [];
  let hasError = false;

  try {
    const response = await getCategories();

    categories = response?.categories ?? response ?? [];

    // Only display active, non-archived categories.
    categories = categories.filter(
      (category) => category.isActive !== false && category.isArchived !== true
    );
  } catch (error) {
    console.error("Categories page error:", error);
    hasError = true;
  }

  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
        {/* Page heading */}
        <div className="mb-7 sm:mb-9">
          <span className="text-xs font-semibold tracking-[0.18em] text-[#FF5A5F] uppercase">
            Find your favourites
          </span>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl lg:text-4xl">
            Explore Categories
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280] sm:text-base">
            Discover gifts, toys and thoughtful products for every special moment.
          </p>
        </div>

        {hasError ? (
          <div className="rounded-2xl border border-[#EDE9E6] bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-bold text-[#242424]">Unable to load categories</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Something went wrong while loading categories. Please try again.
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-[#EDE9E6] bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-bold text-[#242424]">No categories available</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Please check back later for our latest collections.
            </p>
          </div>
        ) : (
          <CategoriesBrowser categories={categories} />
        )}
      </div>
    </div>
  );
}
