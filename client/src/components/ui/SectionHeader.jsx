import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeader({ title, description, href, linkText = "View All" }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#242424] sm:text-2xl">{title}</h2>

        {description && <p className="mt-1 text-xs text-[#6B7280] sm:text-sm">{description}</p>}
      </div>

      {href && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#FF5A5F] transition hover:gap-2 sm:text-sm"
        >
          {linkText}
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
