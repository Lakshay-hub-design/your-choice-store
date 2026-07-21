import { ShieldCheck } from "lucide-react";

export default function InformationCard({ icon: Icon, label, value, verified = false }) {
  return (
    <div className="rounded-2xl border border-[#EDE9E6] bg-[#FFF9F5]/60 p-5">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
          <Icon size={17} className="text-[#6B7280]" />
        </div>

        {/* Information */}
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">{label}</p>

          <div className="mt-1 flex items-center gap-2">
            <p className="text-sm font-medium break-all text-[#242424]">{value}</p>

            {verified && <ShieldCheck size={16} className="shrink-0 text-[#D39D00]" />}
          </div>
        </div>
      </div>
    </div>
  );
}
