import Link from "next/link";
import { ArrowLeft, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export const metadata = {
  title: "Contact Us | YC Gifts & Toys",
  description:
    "Get in touch with YC Gifts & Toys for questions about products, orders, shipping, returns, and more.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FFF9F5]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#FF5A5F]"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mt-8 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FF5A5F]/10 px-3 py-1.5 text-xs font-semibold text-[#FF5A5F]">
            <MessageCircle size={14} />
            We're here to help
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#242424] sm:text-4xl">
            Contact Us
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6B7280] sm:text-base">
            Have a question about a product, order, delivery, return, or anything else? Get in touch
            with our team and we'll be happy to help.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <ContactCard
            icon={<Phone size={21} />}
            title="Call Us"
            description="Need quick help? Give us a call."
            value="+91 97724 23079"
            href="tel:+919772423079"
          />

          <ContactCard
            icon={<Mail size={21} />}
            title="Email Us"
            description="Send us your questions anytime."
            value="your-email@example.com"
            href="mailto:your-email@example.com"
          />

          <ContactCard
            icon={<MapPin size={21} />}
            title="Visit Us"
            description="Our store and business location."
            value="Ajmer, Rajasthan, India"
          />
        </div>

        {/* Support Section */}
        <section className="mt-8 rounded-2xl border border-[#EDE9E6] bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#242424]">How can we help?</h2>

          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            For faster assistance, please include your order number when contacting us about an
            existing order.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SupportItem title="Order Support" description="Questions about an existing order." />

            <SupportItem
              title="Product Questions"
              description="Need more information about a product?"
            />

            <SupportItem title="Shipping" description="Questions about delivery or tracking." />

            <SupportItem
              title="Returns & Refunds"
              description="Need help with a return or refund?"
            />
          </div>
        </section>

        {/* Business Information */}
        <section className="mt-5 rounded-2xl border border-[#EDE9E6] bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#242424]">YC Gifts & Toys</h2>

          <p className="mt-2 text-sm leading-6 text-[#6B7280]">Gifts that create smiles ❤️</p>

          <div className="mt-6 space-y-3 text-sm text-[#6B7280]">
            <p>
              <span className="font-semibold text-[#242424]">Location:</span> Ajmer, Rajasthan,
              India
            </p>

            <p>
              <span className="font-semibold text-[#242424]">Customer Support:</span> Monday –
              Saturday
            </p>

            <p>
              <span className="font-semibold text-[#242424]">Support Hours:</span> 10:00 AM – 6:00
              PM
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-8 rounded-2xl bg-[#FF5A5F] px-6 py-8 text-center sm:px-8">
          <h2 className="text-xl font-bold text-white">Need help with an order?</h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/85">
            Keep your order number ready and contact us. Our team will help you with your query.
          </p>

          <Link
            href="/account/orders"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#FF5A5F] transition hover:-translate-y-0.5 hover:shadow-md"
          >
            View My Orders
            <ArrowLeft size={16} className="rotate-180" />
          </Link>
        </div>
      </div>
    </main>
  );
}

function ContactCard({ icon, title, description, value, href }) {
  const content = (
    <>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF5A5F]/10 text-[#FF5A5F]">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-bold text-[#242424]">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-[#6B7280]">{description}</p>

      <p className="mt-3 text-sm font-semibold break-all text-[#FF5A5F]">{value}</p>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="rounded-2xl border border-[#EDE9E6] bg-white p-5 transition hover:-translate-y-1 hover:border-[#FF5A5F]/30 hover:shadow-sm"
      >
        {content}
      </a>
    );
  }

  return <div className="rounded-2xl border border-[#EDE9E6] bg-white p-5">{content}</div>;
}

function SupportItem({ title, description }) {
  return (
    <div className="rounded-xl bg-[#FFF9F5] p-4">
      <h3 className="text-sm font-semibold text-[#242424]">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-[#6B7280]">{description}</p>
    </div>
  );
}
