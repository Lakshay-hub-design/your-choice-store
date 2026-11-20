import Link from "next/link";
import Image from "next/image";

export default function Logo({ compact = false }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5A5F]/10 text-xl">
        <Image
          src="/images/logo.png"
          alt="YC Gifts & Toys Logo"
          width={24}
          height={24}
          className="h-8 w-8 object-contain"
        />
      </div>

      <div>
        <div className={`font-extrabold tracking-tight ${compact ? "text-sm" : "text-lg"}`}>
          <span className="bg-gradient-to-r from-[#C026D3] via-[#EC1B69] to-[#FF3366] bg-clip-text text-transparent">
            YC
          </span>{" "}
          <span className="text-[#242424]">GIFTS & TOYS</span>
        </div>

        {!compact && <p className="text-[10px] text-[#6B7280]">Gifts that create smiles ❤️</p>}
      </div>
    </Link>
  );
}
