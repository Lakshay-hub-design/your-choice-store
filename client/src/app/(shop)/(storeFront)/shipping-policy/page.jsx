import Link from "next/link";
import { ArrowLeft, Clock3, MapPin, Package, Truck } from "lucide-react";

export const metadata = {
  title: "Shipping Policy | YC Gifts & Toys",
  description:
    "Learn about shipping, order processing, delivery, tracking, and shipping-related information at YC Gifts & Toys.",
};

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FFF9F5]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#FF5A5F]"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mt-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FF5A5F]/10 px-3 py-1.5 text-xs font-semibold text-[#FF5A5F]">
            <Truck size={14} />
            Shipping Information
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#242424] sm:text-4xl">
            Shipping Policy
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B7280] sm:text-base">
            We want your gifts to reach you safely and on time. Here's everything you need to know
            about order processing and delivery.
          </p>

          <p className="mt-2 text-xs text-[#9CA3AF]">Last updated: August 2026</p>
        </div>

        {/* Quick Info */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <InfoCard
            icon={<Package size={20} />}
            title="Order Processing"
            description="Orders are processed after successful order placement."
          />

          <InfoCard
            icon={<Truck size={20} />}
            title="Delivery"
            description="Delivery time may vary depending on your location."
          />

          <InfoCard
            icon={<MapPin size={20} />}
            title="Delivery Area"
            description="We deliver to serviceable locations across India."
          />
        </div>

        {/* Policy */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white">
          <PolicySection number="01" title="Order Processing">
            <p>
              After you place an order, we process it and prepare the products for shipment.
              Processing time can vary depending on product availability, order volume,
              customization requirements, and other operational factors.
            </p>

            <p>Orders containing customized products may require additional processing time.</p>
          </PolicySection>

          <PolicySection number="02" title="Shipping & Delivery">
            <p>
              Once your order is shipped, it is handed over to our delivery partner for
              transportation to the address provided during checkout.
            </p>

            <p>
              Estimated delivery times can vary based on your delivery location, courier
              availability, weather, public holidays, and other circumstances outside our control.
            </p>
          </PolicySection>

          <PolicySection number="03" title="Shipping Charges">
            <p>
              Applicable shipping charges, if any, will be shown during the checkout process before
              you place your order.
            </p>

            <div className="mt-4 rounded-xl bg-[#FFF9F5] p-4">
              <p className="text-sm font-semibold text-[#242424]">Free Delivery</p>

              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                Free delivery may be available on eligible orders according to the offer or shipping
                conditions displayed on the website.
              </p>
            </div>
          </PolicySection>

          <PolicySection number="04" title="Order Tracking">
            <p>
              Once tracking information becomes available, you may be able to track your shipment
              through your order details page.
            </p>

            <p>
              Tracking information may take some time to appear after the order has been handed over
              to the delivery partner.
            </p>
          </PolicySection>

          <PolicySection number="05" title="Delivery Delays">
            <p>
              Although we work to have orders delivered within the expected timeframe, delays can
              occasionally occur because of courier issues, weather conditions, holidays, high order
              volumes, transportation disruptions, or other circumstances.
            </p>

            <p>
              If your order is significantly delayed, please contact our support team with your
              order number.
            </p>
          </PolicySection>

          <PolicySection number="06" title="Incorrect or Incomplete Address">
            <p>
              Please carefully check your delivery address and phone number before placing your
              order.
            </p>

            <p>
              If an order cannot be delivered because of an incorrect, incomplete, or inaccessible
              address, additional delivery attempts or other arrangements may be required.
            </p>
          </PolicySection>

          <PolicySection number="07" title="Failed Delivery">
            <p>
              If the delivery partner is unable to deliver your order after the applicable delivery
              attempts, the shipment may be returned to us.
            </p>

            <p>
              If this happens, please contact our support team so we can determine the appropriate
              next steps for your order.
            </p>
          </PolicySection>

          <PolicySection number="08" title="Damaged Package">
            <p>
              If your package appears damaged at the time of delivery, please document the condition
              of the package and contact us as soon as possible.
            </p>

            <p>
              For damaged, incorrect, or missing products, please refer to our return policy for the
              applicable process.
            </p>
          </PolicySection>
        </div>

        {/* Help CTA */}
        <section className="mt-8 rounded-2xl bg-[#FF5A5F] px-6 py-8 text-center sm:px-8">
          <Clock3 className="mx-auto text-white" size={25} />

          <h2 className="mt-3 text-xl font-bold text-white">Need help with your delivery?</h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/85">
            If you have a question about your shipment or delivery, our support team is here to
            help.
          </p>

          <Link
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#FF5A5F] transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Contact Us
          </Link>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-[#EDE9E6] bg-white p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5A5F]/10 text-[#FF5A5F]">
        {icon}
      </div>

      <h2 className="mt-4 text-sm font-bold text-[#242424]">{title}</h2>

      <p className="mt-1 text-xs leading-5 text-[#6B7280]">{description}</p>
    </div>
  );
}

function PolicySection({ number, title, children }) {
  return (
    <section className="border-b border-[#EDE9E6] p-6 last:border-b-0 sm:p-8">
      <div className="flex gap-4">
        <span className="shrink-0 text-xs font-bold text-[#FF5A5F]">{number}</span>

        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[#242424]">{title}</h2>

          <div className="mt-3 space-y-3 text-sm leading-7 text-[#6B7280]">{children}</div>
        </div>
      </div>
    </section>
  );
}
