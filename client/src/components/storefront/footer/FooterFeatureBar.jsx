import { Truck, ShieldCheck, RotateCcw, BadgeCheck } from "lucide-react";

export default function FooterFeatureBar() {
  return (
    <div className="border-b border-[#E5E7EB] bg-[#FFF9F5]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <Feature icon={Truck} title="Fast Delivery" description="Quick shipping across India" />

        <Feature
          icon={ShieldCheck}
          title="Secure Payments"
          description="100% safe & trusted checkout"
        />

        <Feature icon={RotateCcw} title="Easy Returns" description="Simple return process" />

        <Feature
          icon={BadgeCheck}
          title="Premium Quality"
          description="Carefully selected products"
        />
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FF5A5F]/10">
        <Icon size={22} className="text-[#FF5A5F]" />
      </div>

      <div>
        <h3 className="font-semibold text-[#242424]">{title}</h3>

        <p className="mt-1 text-sm text-[#6B7280]">{description}</p>
      </div>
    </div>
  );
}
