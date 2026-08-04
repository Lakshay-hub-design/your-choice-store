import Link from "next/link";

export default function FooterColumn({ title, links = [] }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-[#242424]">{title}</h3>

      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-[#6B7280] transition hover:text-[#FF5A5F]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
