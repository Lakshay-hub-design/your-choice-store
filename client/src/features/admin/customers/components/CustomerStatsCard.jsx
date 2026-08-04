import { ShoppingBag, IndianRupee } from "lucide-react";

export default function CustomerStatsCard({ stats }) {
  return (
    <div className="space-y-5">
      <StatCard
        title="Total Orders"
        value={stats.totalOrders}
        icon={<ShoppingBag size={22} />}
        color="blue"
      />

      <StatCard
        title="Total Spent"
        value={`₹${stats.totalSpent.toLocaleString("en-IN")}`}
        icon={<IndianRupee size={22} />}
        color="green"
      />
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      accent: "from-blue-500 to-cyan-500",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
      accent: "from-green-500 to-emerald-500",
    },
  };

  const style = colors[color];

  return (
    <div className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5A5F] hover:shadow-lg">
      {/* Top Accent */}
      <div className={`h-1 bg-gradient-to-r ${style.accent}`} />

      <div className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <h2 className="mt-3 text-4xl font-bold text-gray-900">{value}</h2>

          <p className="mt-2 text-xs text-gray-400">Customer lifetime value</p>
        </div>

        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${style.bg} ${style.text} transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
