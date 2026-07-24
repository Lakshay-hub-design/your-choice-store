import ProductCard from "@/features/products/components/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";

export default function ProductSection({ title, description, products = [], href = "/products" }) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="mt-10 sm:mt-12">
      <SectionHeader title={title} description={description} href={href} />

      {/* Mobile */}
      <div className="scrollbar-hide -mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-3 sm:-mx-6 sm:px-6 lg:hidden">
        {products.map((product) => (
          <div
            key={product._id}
            className="w-[68%] min-w-[68%] snap-start sm:w-[42%] sm:min-w-[42%]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden grid-cols-4 gap-5 lg:grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
