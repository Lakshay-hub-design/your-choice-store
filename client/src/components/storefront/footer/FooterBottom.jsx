import Link from "next/link";

export default function FooterBottom() {
  return (
    <div className="border-t border-[#E5E7EB] bg-[#FAFAFA]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-sm text-[#6B7280] sm:flex-row lg:px-8">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-[#242424]">YC GIFTS & TOYS</span>. All rights
          reserved.
        </p>

        <div className="flex flex-wrap items-center gap-5">
          <Link href="/privacy-policy" className="transition hover:text-[#FF5A5F]">
            Privacy
          </Link>

          <Link href="/terms" className="transition hover:text-[#FF5A5F]">
            Terms
          </Link>

          <Link href="/shipping-policy" className="transition hover:text-[#FF5A5F]">
            Shipping
          </Link>

          <Link href="/return-policy" className="transition hover:text-[#FF5A5F]">
            Returns
          </Link>
        </div>
      </div>
    </div>
  );
}
