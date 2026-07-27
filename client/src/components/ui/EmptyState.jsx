import Link from "next/link";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#EDE9E6] bg-white px-6 py-12 text-center">
      {Icon && (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF5A5F]/10 text-[#FF5A5F]">
          <Icon size={25} strokeWidth={1.8} />
        </div>
      )}

      <h2 className="text-lg font-bold text-[#242424] sm:text-xl">{title}</h2>

      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">{description}</p>
      )}

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 rounded-xl bg-[#FF5A5F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f1494e]"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionHref && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-xl bg-[#FF5A5F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f1494e]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
