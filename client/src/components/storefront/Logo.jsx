import Link from "next/link";

export default function Logo({ href = "/", size = "default" }) {
  const sizes = {
    small: {
      logo: "h-9 w-9 text-base",
      title: "text-lg",
      subtitle: "text-[10px]",
    },

    default: {
      logo: "h-11 w-11 text-lg",
      title: "text-xl",
      subtitle: "text-xs",
    },

    large: {
      logo: "h-14 w-14 text-xl",
      title: "text-2xl",
      subtitle: "text-sm",
    },
  };

  const current = sizes[size] || sizes.default;

  return (
    <Link href={href} className="inline-flex items-center gap-3">
      <div
        className={`flex ${current.logo} items-center justify-center rounded-xl bg-[#FF5A5F] font-bold text-white shadow-sm`}
      >
        YC
      </div>

      <div>
        <h1 className={`${current.title} font-bold tracking-tight text-[#242424]`}>
          YC GIFTS & TOYS
        </h1>

        <p className={`${current.subtitle} text-[#6B7280]`}>Gifts for Every Occasion</p>
      </div>
    </Link>
  );
}
