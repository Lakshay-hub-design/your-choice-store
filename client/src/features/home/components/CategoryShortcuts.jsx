import Link from "next/link";
import Image from "next/image";

const shortcutConfig = [
  {
    name: "Gifts",
    slug: "gifts",
    image: "/images/categories/gift.png",
    background: "bg-[#FFF3D6]",
  },
  {
    name: "Soft Toys",
    slug: "soft-toys",
    image: "/images/categories/teady.png",
    background: "bg-[#FFF0E6]",
  },
  {
    name: "Toys & Games",
    slug: "toys-and-games",
    image: "/images/categories/car.png",
    background: "bg-[#EAF1FF]",
  },
  {
    name: "Home & Living",
    slug: "home-and-living",
    image: "/images/categories/home.png",
    background: "bg-[#F0EAFE]",
  },
  {
    name: "Accessories",
    slug: "jewellery-and-accessories",
    image: "/images/categories/accessories.png",
    background: "bg-[#FFECEF]",
  },
  {
    name: "Stationery",
    slug: "stationery-and-gifts",
    image: "/images/categories/stationary.png",
    background: "bg-[#EEEAFE]",
  },
  {
    name: "Party & Celebration",
    slug: "party-and-celebration",
    image: "/images/categories/party.png",
    background: "bg-[#FFF0EA]",
  },
];

const viewAll = {
  name: "View All",
  image: "/images/categories/all.png",
  href: "/products",
  background: "bg-[#FFECEE]",
};

export default async function CategoryShortcuts() {
  let activeCategories = [];

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const result = await response.json();
    activeCategories = result.data || [];
  } catch (error) {
    console.error("Category shortcuts error:", error);
  }

  const categories = shortcutConfig
    .map((shortcut) => {
      const matchedCategory = activeCategories.find((category) => category.slug === shortcut.slug);

      if (!matchedCategory) return null;

      return {
        ...shortcut,
        href: `/products?category=${encodeURIComponent(matchedCategory._id)}`,
      };
    })
    .filter(Boolean);

  const finalCategories = [...categories, viewAll];
  return (
    <section className="mt-5 rounded-2xl border border-[#EDE9E6] bg-white px-2 py-5 sm:px-5">
      {/* Mobile horizontal scroll */}
      <div className="scrollbar-hide flex gap-5 overflow-x-auto px-2 pb-1 lg:hidden">
        {finalCategories.map((category) => (
          <CategoryItem key={category.name} category={category} />
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden grid-cols-8 gap-3 lg:grid">
        {finalCategories.map((category) => (
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
        className={`flex h-[66px] w-[66px] items-center justify-center rounded-full transition duration-200 group-hover:-translate-y-1 group-hover:shadow-md sm:h-[72px] sm:w-[72px] ${category.background}`}
      >
        {category.image && (
          <Image
            src={category.image}
            alt={category.name}
            width={54}
            height={54}
            className="h-[54px] w-[54px] object-contain transition-transform duration-200 group-hover:scale-105"
          />
        )}
      </div>

      <span className="mt-2 max-w-[90px] text-[10px] leading-4 font-semibold text-[#242424] sm:text-[11px]">
        {category.name}
      </span>
    </Link>
  );
}
