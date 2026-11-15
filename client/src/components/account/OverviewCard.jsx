import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function OverviewCard({ icon: Icon, label, value, type = "coral", href }) {
  const styles = {
    coral: {
      container: "bg-[#FF5A5F]/8",
      icon: "bg-[#FF5A5F]/12 text-[#FF5A5F]",
      value: "text-[#FF5A5F]",
      hover: "group-hover:border-[#FF5A5F]/40",
      arrow: "text-[#FF5A5F]",
    },

    purple: {
      container: "bg-[#7C5CFC]/8",
      icon: "bg-[#7C5CFC]/12 text-[#7C5CFC]",
      value: "text-[#7C5CFC]",
      hover: "group-hover:border-[#7C5CFC]/40",
      arrow: "text-[#7C5CFC]",
    },

    yellow: {
      container: "bg-[#FFC83D]/12",
      icon: "bg-[#FFC83D]/20 text-[#B98500]",
      value: "text-[#B98500]",
      hover: "group-hover:border-[#FFC83D]/60",
      arrow: "text-[#B98500]",
    },
  };

  const style = styles[type] || styles.coral;

  const cardContent = (
    <div
      className={`group flex items-center justify-between rounded-2xl border border-[#EDE9E6] p-5 transition-all duration-200 ${
        style.container
      } ${href ? `cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${style.hover}` : ""}`}
    >
      {/* Information */}
      <div>
        <p className="text-xs font-medium text-[#6B7280] uppercase">{label}</p>

        <p className={`mt-2 text-xl font-bold ${style.value}`}>{value}</p>
      </div>

      {/* Icon and Arrow */}
      <div className="flex items-center gap-2">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${style.icon}`}>
          <Icon size={23} />
        </div>

        {href && (
          <ArrowUpRight
            size={17}
            className={`transition-all duration-200 ${style.arrow} -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100`}
          />
        )}
      </div>
    </div>
  );

  if (!href) {
    return cardContent;
  }

  return (
    <Link
      href={href}
      aria-label={`View ${label}`}
      className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A5F] focus-visible:ring-offset-2"
    >
      {cardContent}
    </Link>
  );
}
