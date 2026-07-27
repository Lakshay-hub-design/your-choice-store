import { notFound } from "next/navigation";

import ProductGallery from "@/features/products/components/ProductGallery";
import ProductInfo from "@/features/products/components/ProductInfo";
import RelatedProducts from "@/features/products/components/RelatedProducts";

import { getProductBySlug, getRelatedProducts } from "@/features/products/services/productService";

import RecentlyViewedTracker from "@/features/products/components/RecentlyViewedTracker";
import RecentlyViewedProducts from "@/features/products/components/RecentlyViewedProducts";

export default async function ProductDetailsPage({ params }) {
  const { slug } = await params;

  let product;
  let relatedProducts = [];

  try {
    [product, relatedProducts] = await Promise.all([
      getProductBySlug(slug),
      getRelatedProducts(slug),
    ]);
  } catch (error) {
    console.error("Product details error:", error);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Your existing breadcrumb */}

        <div className="grid gap-7 rounded-2xl border border-[#EDE9E6] bg-white p-3 sm:p-5 lg:grid-cols-2 lg:gap-10 lg:p-7">
          <ProductGallery images={product.images} productName={product.name} />

          <ProductInfo product={product} />
        </div>

        {/* Description */}
        {product.description && (
          <section className="mt-6 rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-7">
            <h2 className="text-xl font-bold text-[#242424]">Product Description</h2>

            <div className="mt-4 text-sm leading-7 whitespace-pre-line text-[#6B7280]">
              {product.description}
            </div>
          </section>
        )}

        {/* Related products */}
        <RelatedProducts products={relatedProducts} />

        <RecentlyViewedProducts excludeProductId={product._id} />
        <RecentlyViewedTracker product={product} />
      </div>
    </div>
  );
}
