import { Users } from "lucide-react";

export default function CustomerEmpty() {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF5A5F]/10">
        <Users size={28} className="text-[#FF5A5F]" />
      </div>

      <h2 className="mt-5 text-xl font-bold text-[#242424]">No Customers Found</h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
        No customers match your current search or filters.
      </p>
    </div>
  );
}
