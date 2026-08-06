"use client";

import { useState } from "react";

import Link from "next/link";

import { ChevronDown, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

const sections = [
  {
    title: "Shop",
    links: [
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
    ],
  },

  {
    title: "Customer",
    links: [
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
    ],
  },

  {
    title: "Help",
    links: [
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
    ],
  },
];

export default function FooterAccordion() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (title) => {
    setOpenSection((current) => (current === title ? null : title));
  };

  return (
    <div className="lg:hidden">
      {/* Brand */}

      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="rounded-xl bg-[#FF5A5F] px-3 py-2 text-lg font-bold text-white">YC</span>

          <div>
            <h2 className="font-bold text-[#242424]">YC GIFTS & TOYS</h2>

            <p className="text-xs text-[#6B7280]">Gifts for Every Occasion</p>
          </div>
        </Link>

        <p className="mt-4 text-sm leading-7 text-[#6B7280]">
          Discover thoughtful gifts, personalized keepsakes and toys that make every celebration
          memorable.
        </p>

        <div className="mt-6 flex gap-3">
          <SocialIcon href="#">
            <FaFacebook size={18} />
          </SocialIcon>

          <SocialIcon href="#">
            <FaInstagram size={18} />
          </SocialIcon>

          <SocialIcon href="#">
            <Phone size={18} />
          </SocialIcon>
        </div>
      </div>

      {/* Accordion */}

      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openSection === section.title;

          return (
            <div key={section.title} className="overflow-hidden rounded-xl border border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between bg-white px-5 py-4"
              >
                <span className="font-semibold text-[#242424]">{section.title}</span>

                <ChevronDown
                  size={18}
                  className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-3 border-t border-[#E5E7EB] bg-[#FAFAFA] px-5 py-4">
                    {section.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="block text-sm text-[#6B7280] hover:text-[#FF5A5F]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact */}

      <div className="mt-8 rounded-2xl bg-[#FFF9F5] p-5">
        <h3 className="font-semibold text-[#242424]">Contact</h3>

        <div className="mt-4 space-y-4 text-sm text-[#6B7280]">
          <div className="flex gap-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-[#FF5A5F]" />

            <span>Jaipur, Rajasthan, India</span>
          </div>

          <div className="flex gap-3">
            <Phone size={18} className="text-[#FF5A5F]" />

            <span>+91 XXXXX XXXXX</span>
          </div>

          <div className="flex gap-3">
            <Mail size={18} className="text-[#FF5A5F]" />

            <span>support@ycgifts.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialIcon({ href, children }) {
  return (
    <Link
      href={href}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:border-[#FF5A5F] hover:bg-[#FF5A5F] hover:text-white"
    >
      {children}
    </Link>
  );
}
