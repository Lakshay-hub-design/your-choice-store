export default function DashboardStatCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
}) {
  const variants = {
    default: {
      icon: "bg-[#FF5A5F]/10 text-[#FF5A5F]",
    },

    green: {
      icon: "bg-green-50 text-green-600",
    },

    amber: {
      icon: "bg-amber-50 text-amber-600",
    },

    red: {
      icon: "bg-red-50 text-red-600",
    },

    purple: {
      icon: "bg-purple-50 text-purple-600",
    },

    blue: {
      icon: "bg-blue-50 text-blue-600",
    },
  };

  const style = variants[variant] || variants.default;

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-[#242424]">{value}</p>

          {description && <p className="mt-1 text-xs text-[#9CA3AF]">{description}</p>}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
