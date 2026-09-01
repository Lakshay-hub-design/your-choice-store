import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  RefreshCcw,
  XCircle,
} from "lucide-react";

export const metadata = {
  title: "Return & Refund Policy | YC Gifts & Toys",
  description:
    "Learn about returns, replacements, refunds, damaged products, incorrect orders, and issue resolution at YC Gifts & Toys.",
};

export default function ReturnPolicyPage() {
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
            <RefreshCcw size={14} />
            Returns & Refunds
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#242424] sm:text-4xl">
            Return & Refund Policy
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B7280] sm:text-base">
            We want you to be happy with your purchase. If something goes wrong with your order,
            please contact us and we'll review the issue.
          </p>

          <p className="mt-2 text-xs text-[#9CA3AF]">Last updated: August 2026</p>
        </div>

        {/* Important Notice */}
        <section className="mt-8 rounded-2xl border border-[#FFC83D]/40 bg-[#FFF8E5] p-5 sm:p-6">
          <div className="flex gap-3">
            <AlertCircle size={21} className="mt-0.5 shrink-0 text-[#C28A00]" />

            <div>
              <h2 className="text-sm font-bold text-[#242424]">Important Return Information</h2>

              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                We do not offer general returns for change-of-mind purchases. If you receive a
                damaged, defective, incorrect, missing, or materially different product, please
                contact our support team so we can review the issue and determine the appropriate
                resolution.
              </p>
            </div>
          </div>
        </section>

        {/* Eligible Issues */}
        <section className="mt-8 rounded-2xl border border-[#EDE9E6] bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#242424]">When can I request a resolution?</h2>

          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Please contact us if you experience one of the following issues with your order.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <IssueCard
              icon={<CheckCircle2 size={19} />}
              title="Wrong Product"
              description="You received a product different from what you ordered."
            />

            <IssueCard
              icon={<CheckCircle2 size={19} />}
              title="Damaged Product"
              description="The product was damaged during delivery or arrived in an unusable condition."
            />

            <IssueCard
              icon={<CheckCircle2 size={19} />}
              title="Defective Product"
              description="The product has a manufacturing or functional defect."
            />

            <IssueCard
              icon={<CheckCircle2 size={19} />}
              title="Missing Item"
              description="An item from your order is missing from the delivered package."
            />

            <IssueCard
              icon={<CheckCircle2 size={19} />}
              title="Significantly Different"
              description="The product received is materially different from its description or ordered specifications."
            />

            <IssueCard
              icon={<CheckCircle2 size={19} />}
              title="Other Order Issues"
              description="If you believe there is another genuine issue with your order, contact our support team for review."
            />
          </div>
        </section>

        {/* Not Eligible */}
        <section className="mt-5 rounded-2xl border border-[#EDE9E6] bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#242424]">
            Situations generally not eligible for return
          </h2>

          <div className="mt-5 space-y-3">
            <NotEligibleItem>Change of mind after placing the order.</NotEligibleItem>

            <NotEligibleItem>Customer no longer wants the product.</NotEligibleItem>

            <NotEligibleItem>
              Product does not match the customer's personal preference or expectation when the
              product is otherwise as described.
            </NotEligibleItem>

            <NotEligibleItem>
              Damage caused after delivery through misuse, improper handling, or normal wear and
              tear.
            </NotEligibleItem>

            <NotEligibleItem>
              Customized or personalized products may not be eligible for return when there is no
              product defect or fulfillment error.
            </NotEligibleItem>
          </div>
        </section>

        {/* Customized Products */}
        <section className="mt-5 rounded-2xl border border-[#EDE9E6] bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#242424]">Customized & Personalized Products</h2>

          <p className="mt-3 text-sm leading-7 text-[#6B7280]">
            Customized and personalized products are prepared specifically according to the
            customer's submitted requirements. Because of their personalized nature, they generally
            cannot be returned due to change of mind.
          </p>

          <p className="mt-3 text-sm leading-7 text-[#6B7280]">
            However, if a customized product is defective, damaged, incorrectly personalized, or
            does not match the confirmed customization details, please contact us so we can review
            the issue.
          </p>
        </section>

        {/* How to Request */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#242424]">How to report an issue</h2>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              If there is a problem with your order, please follow these steps.
            </p>

            <div className="mt-7 space-y-6">
              <Step
                number="01"
                title="Contact us"
                description="Contact our support team and provide your order number."
              />

              <Step
                number="02"
                title="Explain the issue"
                description="Tell us what went wrong and provide relevant details about the product."
              />

              <Step
                number="03"
                title="Share photos when applicable"
                description="For damaged, incorrect, defective, or materially different products, clear photos may be requested to help us investigate the issue."
              />

              <Step
                number="04"
                title="We review your request"
                description="Our team will review the information provided and determine the appropriate resolution."
              />
            </div>
          </div>
        </section>

        {/* Evidence */}
        <section className="mt-5 rounded-2xl border border-[#EDE9E6] bg-white p-6 sm:p-8">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7C5CFC]/10 text-[#7C5CFC]">
              <ImageIcon size={19} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#242424]">Photos & supporting information</h2>

              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Depending on the issue, we may ask for photos, videos, or additional information
                about the product and packaging. This helps us verify the issue and process your
                request fairly.
              </p>
            </div>
          </div>
        </section>

        {/* Resolution */}
        <section className="mt-5 rounded-2xl border border-[#EDE9E6] bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#242424]">Possible resolutions</h2>

          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Depending on the circumstances and availability, an approved issue may be resolved
            through one of the following:
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <ResolutionCard
              title="Replacement"
              description="A replacement product may be provided when appropriate and available."
            />

            <ResolutionCard
              title="Refund"
              description="A refund may be issued when a replacement is not appropriate or available."
            />

            <ResolutionCard
              title="Other Resolution"
              description="Another appropriate resolution may be offered depending on the circumstances."
            />
          </div>
        </section>

        {/* Refund Information */}
        <section className="mt-5 rounded-2xl border border-[#EDE9E6] bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#242424]">Refunds</h2>

          <p className="mt-3 text-sm leading-7 text-[#6B7280]">
            If a refund is approved, the refund will be processed using the applicable payment
            method or refund process associated with the order.
          </p>

          <p className="mt-3 text-sm leading-7 text-[#6B7280]">
            For online payments, the refund may be processed through the payment provider. The time
            taken for the amount to appear in your account can depend on the payment provider and
            your bank.
          </p>

          <p className="mt-3 text-sm leading-7 text-[#6B7280]">
            For Cash on Delivery orders, we may request appropriate payment details or use another
            available refund method where applicable.
          </p>
        </section>

        {/* Final CTA */}
        <section className="mt-8 rounded-2xl bg-[#FF5A5F] px-6 py-8 text-center sm:px-8">
          <h2 className="text-xl font-bold text-white">Something went wrong with your order?</h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/85">
            Don't worry. Contact us with your order number and we'll review the issue.
          </p>

          <Link
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#FF5A5F] transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Contact Us
          </Link>
        </section>

        {/* Disclaimer */}
        <p className="mt-6 text-center text-xs leading-5 text-[#9CA3AF]">
          This policy describes our current store process for handling product and order issues.
          Specific resolutions may depend on the nature of the issue, product condition, and
          applicable consumer protection requirements.
        </p>
      </div>
    </main>
  );
}

function IssueCard({ icon, title, description }) {
  return (
    <div className="rounded-xl bg-[#FFF9F5] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-green-600">{icon}</div>

        <div>
          <h3 className="text-sm font-semibold text-[#242424]">{title}</h3>

          <p className="mt-1 text-xs leading-5 text-[#6B7280]">{description}</p>
        </div>
      </div>
    </div>
  );
}

function NotEligibleItem({ children }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#FFF9F9] p-4">
      <XCircle size={18} className="mt-0.5 shrink-0 text-red-500" />

      <p className="text-sm leading-6 text-[#6B7280]">{children}</p>
    </div>
  );
}

function Step({ number, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF5A5F] text-[10px] font-bold text-white">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-bold text-[#242424]">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-[#6B7280]">{description}</p>
      </div>
    </div>
  );
}

function ResolutionCard({ title, description }) {
  return (
    <div className="rounded-xl border border-[#EDE9E6] p-4">
      <h3 className="text-sm font-bold text-[#242424]">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-[#6B7280]">{description}</p>
    </div>
  );
}
