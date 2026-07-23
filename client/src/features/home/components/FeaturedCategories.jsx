import Link from "next/link";

import SectionHeader from "@/components/ui/SectionHeader";

export default function FeaturedCategories({ categories = [] }) {
  if (!categories.length) {
    return null;
  }

  return (
    <section className="mt-10 sm:mt-12">
      <SectionHeader
        title="Featured Categories"
        description="Find the perfect gift for every special moment."
        href="/categories"
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {categories.slice(0, 4).map((category) => (
          <CategoryCard key={category._id} category={category} />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ category }) {
  const image = category.image?.url || category.image?.secure_url;

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group relative min-h-[175px] overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white sm:min-h-[220px]"
    >
      {image ? (
        <img
          src={image}
          alt={category.name}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFE7E2] to-[#FFF5F2]" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
        <h3 className="text-sm font-bold text-white sm:text-lg">{category.name}</h3>

        <span className="mt-1 inline-block text-[10px] font-semibold text-white/90 sm:text-xs">
          Explore Collection →
        </span>
      </div>
    </Link>
  );
}
