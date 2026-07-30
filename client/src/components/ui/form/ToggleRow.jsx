export default function ToggleRow({ title, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5">
      <div>
        <p className="text-sm font-semibold text-[#242424]">{title}</p>

        {description && <p className="mt-0.5 text-xs leading-5 text-[#9CA3AF]">{description}</p>}
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 accent-[#FF5A5F]"
      />
    </label>
  );
}
