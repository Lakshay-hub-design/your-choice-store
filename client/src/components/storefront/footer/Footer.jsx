import FooterColumn from "./FooterColumn";
import FooterFeatureBar from "./FooterFeatureBar";
import FooterBottom from "./FooterBottom";
import FooterAccordion from "./FooterAccordion";

import { STORE } from "@/config/store";

import Link from "next/link";

import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[#E5E7EB] bg-white">
      <FooterFeatureBar />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Desktop */}

        <div className="hidden gap-10 lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1.4fr]">
          {/* Brand */}

          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="rounded-xl bg-[#FF5A5F] px-3 py-2 text-lg font-bold text-white">
                YC
              </span>

              <div>
                <p className="text-lg font-bold text-[#242424]">{STORE.name}</p>

                <p className="text-xs text-[#6B7280]">{STORE.tagline}</p>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-[#6B7280]">{STORE.description}</p>

            <div className="mt-6 flex items-center gap-4">
              <SocialIcon href="#">
                <Facebook size={18} />
              </SocialIcon>

              <SocialIcon href="#">
                <Instagram size={18} />
              </SocialIcon>

              <SocialIcon href="#">
                <Phone size={18} />
              </SocialIcon>
            </div>
          </div>

          <FooterColumn
            title="Shop"
            links={[
              {
                label: "All Products",
                href: "/products",
              },
              {
                label: "Gift Items",
                href: "/products",
              },
              {
                label: "Toys",
                href: "/products",
              },
              {
                label: "New Arrivals",
                href: "/products",
              },
              {
                label: "Best Sellers",
                href: "/products",
              },
            ]}
          />

          <FooterColumn
            title="Customer"
            links={[
              {
                label: "My Account",
                href: "/account",
              },
              {
                label: "My Orders",
                href: "/account/orders",
              },
              {
                label: "Wishlist",
                href: "/wishlist",
              },
              {
                label: "Track Order",
                href: "/track-order",
              },
            ]}
          />

          <FooterColumn
            title="Help"
            links={[
              {
                label: "Contact Us",
                href: "/contact",
              },
              {
                label: "Shipping Policy",
                href: "/shipping-policy",
              },
              {
                label: "Return Policy",
                href: "/return-policy",
              },
              {
                label: "Privacy Policy",
                href: "/privacy-policy",
              },
            ]}
          />

          {/* Contact */}

          <div>
            <h3 className="text-base font-semibold text-[#242424]">Contact</h3>

            <div className="mt-5 space-y-4 text-sm text-[#6B7280]">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#FF5A5F]" />

                <span>{STORE.address}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#FF5A5F]" />

                <span>{STORE.phone}</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#FF5A5F]" />

                <span>{STORE.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile */}

        <FooterAccordion />
      </div>

      <FooterBottom />
    </footer>
  );
}

function SocialIcon({ href, children }) {
  return (
    <Link
      href={href}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] transition hover:border-[#FF5A5F] hover:bg-[#FF5A5F] hover:text-white"
    >
      {children}
    </Link>
  );
}
