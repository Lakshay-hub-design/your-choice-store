import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [] }) {
  if (!products.length) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-[#EDE9E6] bg-white px-6 text-center">
        <div className="text-5xl">🎁</div>

        <h2 className="mt-4 text-lg font-bold text-[#242424]">No products found</h2>

        <p className="mt-2 max-w-sm text-sm leading-6 text-[#6B7280]">
          Try changing your filters or searching for something else.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
