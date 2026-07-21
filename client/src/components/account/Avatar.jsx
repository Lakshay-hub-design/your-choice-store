export default function Avatar({ initials, size = "default" }) {
  const sizes = {
    default: "h-20 w-20 text-xl",
    small: "h-14 w-14 text-sm",
    mobile: "h-16 w-16 text-lg",
  };

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5A5F] to-[#7C5CFC] font-bold text-white shadow-md ${sizes[size]}`}
    >
      {initials}
    </div>
  );
}

export function getInitials(name) {
  if (!name) return "U";

  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}
