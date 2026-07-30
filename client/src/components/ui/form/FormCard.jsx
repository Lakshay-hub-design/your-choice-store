export default function FormCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] px-5 py-4 sm:px-6">
        <h2 className="font-semibold text-[#242424]">{title}</h2>

        {description && <p className="mt-1 text-xs text-[#9CA3AF]">{description}</p>}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
