import { BadgeCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const benefits = [
  {
    title: "Free Delivery",
    description: "on orders above ₹499",
    icon: Truck,
    iconClass: "text-[#FF5A5F] bg-[#FF5A5F]/10",
  },
  {
    title: "Secure Payment",
    description: "100% protected",
    icon: ShieldCheck,
    iconClass: "text-green-600 bg-green-50",
  },
  {
    title: "Easy Returns",
    description: "7 days return policy",
    icon: RotateCcw,
    iconClass: "text-orange-500 bg-orange-50",
  },
  {
    title: "Top Quality",
    description: "Premium products",
    icon: BadgeCheck,
    iconClass: "text-[#d99a00] bg-[#FFC83D]/15",
  },
];

export default function TrustBenefits() {
  return (
    <section className="border-x border-b border-[#EDE9E6] bg-white">
      <div className="grid grid-cols-2 divide-x divide-y divide-[#EDE9E6] md:grid-cols-4 md:divide-y-0">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <div
              key={benefit.title}
              className="flex items-center justify-center gap-3 px-3 py-4 sm:px-5"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${benefit.iconClass}`}
              >
                <Icon size={19} />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-[#242424] sm:text-sm">{benefit.title}</h3>

                <p className="mt-0.5 text-[9px] text-[#6B7280] sm:text-[10px]">
                  {benefit.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
