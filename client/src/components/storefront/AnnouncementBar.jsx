import { Gift, Headphones, PackageCheck, Truck } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="border-b border-[#EDE9E6] bg-[#FFF1EE]">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-[11px] font-medium text-[#242424] sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5">
          <Truck size={13} className="text-[#FF5A5F]" />

          <span>Free Delivery on orders above ₹499</span>
        </div>

        <div className="hidden items-center gap-1.5 md:flex">
          <Gift size={13} className="text-[#FF5A5F]" />

          <span>Special Gifts for Every Occasion</span>
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          <span className="flex items-center gap-1.5">
            <Headphones size={12} />
            Customer Support
          </span>

          <span className="flex items-center gap-1.5">
            <PackageCheck size={12} />
            Track Order
          </span>
        </div>
      </div>
    </div>
  );
}
