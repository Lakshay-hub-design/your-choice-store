import { Check } from "lucide-react";

export default function AdminOrderTimeline({ history = [] }) {
  if (!history.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <h2 className="font-semibold text-[#242424]">Status History</h2>

      <div className="mt-5">
        {history.map((item, index) => {
          const isLast = index === history.length - 1;

          return (
            <div key={`${item.status}-${item.timestamp}-${index}`} className="relative flex gap-4">
              {!isLast && <div className="absolute top-8 bottom-0 left-[15px] w-px bg-[#E5E7EB]" />}

              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF5A5F]/10">
                <Check size={14} className="text-[#FF5A5F]" />
              </div>

              <div className={`min-w-0 ${!isLast ? "pb-6" : ""}`}>
                <p className="text-sm font-semibold text-[#242424]">{formatStatus(item.status)}</p>

                <p className="mt-1 text-xs text-[#9CA3AF]">{formatDateTime(item.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatStatus(status = "") {
  if (!status) return "—";

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function formatDateTime(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
