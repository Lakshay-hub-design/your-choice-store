export default function OverviewCard({ icon: Icon, label, value, type = "coral" }) {
  const styles = {
    coral: {
      container: "bg-[#FF5A5F]/8",
      icon: "bg-[#FF5A5F]/12 text-[#FF5A5F]",
      value: "text-[#FF5A5F]",
    },

    purple: {
      container: "bg-[#7C5CFC]/8",
      icon: "bg-[#7C5CFC]/12 text-[#7C5CFC]",
      value: "text-[#7C5CFC]",
    },

    yellow: {
      container: "bg-[#FFC83D]/12",
      icon: "bg-[#FFC83D]/20 text-[#B98500]",
      value: "text-[#B98500]",
    },
  };

  const style = styles[type] || styles.coral;

  return (
    <div
      className={`flex items-center justify-between rounded-2xl border border-[#EDE9E6] p-5 ${style.container}`}
    >
      {/* Information */}
      <div>
        <p className="text-xs font-medium text-[#6B7280] uppercase">{label}</p>

        <p className={`mt-2 text-xl font-bold ${style.value}`}>{value}</p>
      </div>

      {/* Icon */}
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${style.icon}`}>
        <Icon size={23} />
      </div>
    </div>
  );
}
