import { Boxes, IndianRupee, PackageCheck, ShoppingCart } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">Dashboard</h1>

        <p className="mt-1 text-sm text-[#6B7280]">An overview of your store's activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value="—" icon={IndianRupee} />

        <StatCard label="Total Orders" value="—" icon={ShoppingCart} />

        <StatCard label="Products" value="—" icon={Boxes} />

        <StatCard label="Pending Orders" value="—" icon={PackageCheck} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DashboardPanel title="Recent Orders">
          <EmptyPanel>Recent orders will appear here.</EmptyPanel>
        </DashboardPanel>

        <DashboardPanel title="Low Stock">
          <EmptyPanel>Low-stock products will appear here.</EmptyPanel>
        </DashboardPanel>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#6B7280]">{label}</p>

          <p className="mt-2 text-2xl font-bold text-[#242424]">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF5A5F]/10 text-[#FF5A5F]">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function DashboardPanel({ title, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] px-5 py-4">
        <h2 className="font-semibold text-[#242424]">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function EmptyPanel({ children }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center p-6 text-center text-sm text-[#9CA3AF]">
      {children}
    </div>
  );
}
