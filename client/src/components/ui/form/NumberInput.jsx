export const inputClass =
  "h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-sm text-[#242424] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/10 disabled:cursor-not-allowed disabled:bg-[#F8F9FB]";

export default function NumberInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-[#6B7280]">₹</span>

      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pl-8`}
      />
    </div>
  );
}
