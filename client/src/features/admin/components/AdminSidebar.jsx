"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Boxes,
  FolderTree,
  LayoutDashboard,
  PackageCheck,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Boxes,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: PackageCheck,
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
];

export default function AdminSidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Desktop */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] border-r border-[#E5E7EB] bg-white lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile */}

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          <aside className="relative h-full w-[280px] max-w-[85vw] bg-white shadow-xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={onClose}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F8F9FB]"
            >
              <X size={19} />
            </button>

            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarContent({ onNavigate }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}

      <div className="flex h-[72px] items-center border-b border-[#E5E7EB] px-5">
        <Link href="/admin" onClick={onNavigate} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5A5F]/10 text-xl">
            🎁
          </div>

          <div>
            <div className="font-extrabold tracking-tight">
              <span className="text-[#FF5A5F]">YC</span>{" "}
              <span className="text-[#242424]">ADMIN</span>
            </div>

            <p className="text-[10px] text-[#9CA3AF]">Gifts & Toys</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                active
                  ? "bg-[#FF5A5F]/10 text-[#FF5A5F]"
                  : "text-[#6B7280] hover:bg-[#F8F9FB] hover:text-[#242424]"
              }`}
            >
              <Icon size={19} />

              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Store */}

      <div className="border-t border-[#E5E7EB] p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#242424]"
        >
          <ShoppingBag size={19} />
          View Store
        </Link>
      </div>
    </div>
  );
}
