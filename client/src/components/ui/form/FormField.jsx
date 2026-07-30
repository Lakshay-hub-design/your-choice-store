export default function FormField({ label, required = false, className = "", children }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-[#242424]">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
}
