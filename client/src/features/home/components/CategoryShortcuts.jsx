import Link from "next/link";

const categories = [
  {
    name: "Personalized Gifts",
    icon: "🎁",
    href: "/products?category=personalized-gifts",
    background: "bg-[#FFF3D6]",
  },
  {
    name: "Soft Toys",
    icon: "🧸",
    href: "/products?category=soft-toys",
    background: "bg-[#FFF0E6]",
  },
  {
    name: "Toys & Games",
    icon: "🚗",
    href: "/products?category=toys-games",
    background: "bg-[#EAF1FF]",
  },
  {
    name: "Home & Living",
    icon: "☕",
    href: "/products?category=home-living",
    background: "bg-[#F0EAFE]",
  },
  {
    name: "Accessories",
    icon: "💍",
    href: "/products?category=accessories",
    background: "bg-[#FFECEF]",
  },
  {
    name: "Stationery",
    icon: "✏️",
    href: "/products?category=stationery",
    background: "bg-[#EEEAFE]",
  },
  {
    name: "Party Supplies",
    icon: "🎉",
    href: "/products?category=party-supplies",
    background: "bg-[#FFF0EA]",
  },
  {
    name: "View All",
    icon: "▦",
    href: "/categories",
    background: "bg-[#FFECEE]",
  },
];

export default function CategoryShortcuts() {
  return (
    <section className="mt-5 rounded-2xl border border-[#EDE9E6] bg-white px-2 py-5 sm:px-5">
      {/* Mobile horizontal scroll */}
      <div className="scrollbar-hide flex gap-5 overflow-x-auto px-2 pb-1 lg:hidden">
        {categories.map((category) => (
          <CategoryItem key={category.name} category={category} />
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden grid-cols-8 gap-3 lg:grid">
        {categories.map((category) => (
          <CategoryItem key={category.name} category={category} />
        ))}
      </div>
    </section>
  );
}

function CategoryItem({ category }) {
  return (
    <Link
      href={category.href}
      className="group flex min-w-[78px] flex-col items-center text-center"
    >
      <div
        className={`flex h-[66px] w-[66px] items-center justify-center rounded-full text-[30px] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-md sm:h-[72px] sm:w-[72px]`}
      >
        <div
          className={`flex h-full w-full items-center justify-center rounded-full ${category.background}`}
        >
          {category.icon}
        </div>
      </div>

      <span className="mt-2 max-w-[90px] text-[10px] leading-4 font-semibold text-[#242424] sm:text-[11px]">
        {category.name}
      </span>
    </Link>
  );
}
