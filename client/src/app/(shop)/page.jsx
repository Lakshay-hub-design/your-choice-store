import HeroBanner from "@/features/home/components/HeroBanner";
import TrustBenefits from "@/features/home/components/TrustBenefits";
import CategoryShortcuts from "@/features/home/components/CategoryShortcuts";
import FeaturedCategories from "@/features/home/components/FeaturedCategories";
import ProductSection from "@/features/home/components/ProductSection";

import { getProducts } from "@/features/products/services/productService";

import { getCategories } from "@/features/categories/services/categoryService";

export default async function HomePage() {
  let bestSellers = [];
  let featuredProducts = [];
  let categories = [];

  try {
    const [bestSellerData, featuredData, categoryData] = await Promise.all([
      getProducts({
        isBestSeller: true,
        limit: 4,
      }),

      getProducts({
        isFeatured: true,
        limit: 4,
      }),

      getCategories(),
    ]);

    bestSellers = bestSellerData?.products ?? [];

    featuredProducts = featuredData?.products ?? [];

    categories = categoryData?.categories ?? categoryData ?? [];
  } catch (error) {
    console.error("Homepage data error:", error);
  }

  return (
    <div className="bg-[#FFF9F5]">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <HeroBanner />

        <TrustBenefits />

        <CategoryShortcuts />

        <FeaturedCategories categories={categories} />

        <ProductSection
          title="Best Sellers"
          description="Our most loved gifts and toys."
          products={bestSellers}
          href="/products?sort=best"
        />

        <ProductSection
          title="Featured Products"
          description="Handpicked gifts just for you."
          products={featuredProducts}
          href="/products?featured=true"
        />
      </div>
    </div>
  );
}
