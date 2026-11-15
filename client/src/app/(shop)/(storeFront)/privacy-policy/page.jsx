import Link from "next/link";
import { ShieldCheck, LockKeyhole, UserRound, CreditCard, Cookie, Mail } from "lucide-react";

const sections = [
  { id: "introduction", title: "1. Introduction" },
  { id: "information", title: "2. Information We Collect" },
  { id: "usage", title: "3. How We Use Your Information" },
  { id: "payments", title: "4. Payments and Transactions" },
  { id: "sharing", title: "5. Sharing Your Information" },
  { id: "cookies", title: "6. Cookies and Tracking" },
  { id: "security", title: "7. Data Security" },
  { id: "retention", title: "8. Data Retention" },
  { id: "rights", title: "9. Your Privacy Rights" },
  { id: "children", title: "10. Children's Privacy" },
  { id: "changes", title: "11. Changes to This Policy" },
  { id: "contact", title: "12. Contact Us" },
];

const policySections = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: (
      <>
        <p>
          Welcome to YC Gifts & Toys. We value your trust and are committed to protecting your
          personal information when you visit our website, create an account, place an order, or
          contact us.
        </p>
        <p>
          This Privacy Policy explains what information we collect, how we use it, when we share it,
          and the choices available to you.
        </p>
        <p>By using our website, you acknowledge that you have read this Privacy Policy.</p>
      </>
    ),
  },
  {
    id: "information",
    title: "2. Information We Collect",
    content: (
      <>
        <p>Depending on how you use our website, we may collect:</p>
        <ul>
          <li>
            <strong>Personal details:</strong> Name, email address and mobile number.
          </li>
          <li>
            <strong>Account information:</strong> Login credentials and account-related information.
          </li>
          <li>
            <strong>Delivery information:</strong> House or flat number, street, city, state, PIN
            code and delivery instructions.
          </li>
          <li>
            <strong>Order information:</strong> Products purchased, quantities, order history,
            payment status and transaction references.
          </li>
          <li>
            <strong>Communication information:</strong> Messages and information you provide when
            contacting customer support.
          </li>
          <li>
            <strong>Technical information:</strong> IP address, browser type, device information and
            website usage data, where collected.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "usage",
    title: "3. How We Use Your Information",
    content: (
      <>
        <p>We may use your information to:</p>
        <ul>
          <li>Create and manage customer accounts.</li>
          <li>Process and fulfil orders.</li>
          <li>Arrange shipping and deliver products.</li>
          <li>Send order confirmations, invoices and delivery updates.</li>
          <li>Process payments, refunds and cancellations.</li>
          <li>Respond to customer queries and support requests.</li>
          <li>Improve our products, services and website experience.</li>
          <li>Detect fraudulent activity and protect our website.</li>
          <li>Meet applicable legal and regulatory obligations.</li>
        </ul>
      </>
    ),
  },
  {
    id: "payments",
    title: "4. Payments and Transactions",
    content: (
      <>
        <p>
          Online payments on our website may be processed through third-party payment service
          providers, including Razorpay.
        </p>
        <p>
          Your payment information is handled according to the payment provider's privacy and
          security practices. We may receive transaction references, payment status and related
          information required to manage your order.
        </p>
        <p>
          We do not intend to store complete card numbers, CVV numbers or other sensitive payment
          credentials on our servers.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "5. Sharing Your Information",
    content: (
      <>
        <p>
          We do not sell your personal information to third parties. We may share relevant
          information with trusted service providers when necessary to operate our store, including:
        </p>
        <ul>
          <li>
            <strong>Payment providers:</strong> To process payments and refunds.
          </li>
          <li>
            <strong>Shipping and delivery partners:</strong> To deliver your orders and manage
            shipment tracking.
          </li>
          <li>
            <strong>Email service providers:</strong> To send account verification, password reset
            and order-related emails.
          </li>
          <li>
            <strong>Technology providers:</strong> To host, secure and maintain our website and
            services.
          </li>
        </ul>
        <p>
          We may also disclose information when required by law, a valid legal request, or to
          protect our rights and customers.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "6. Cookies and Tracking",
    content: (
      <>
        <p>
          Our website may use cookies and similar technologies to support essential website
          functionality, maintain login sessions, remember preferences and improve the shopping
          experience.
        </p>
        <p>
          You can manage cookies through your browser settings. Disabling certain cookies may affect
          some website features.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "7. Data Security",
    content: (
      <>
        <p>
          We use reasonable technical and organizational measures to help protect your personal
          information against unauthorized access, alteration, disclosure or loss.
        </p>
        <p>
          However, no method of internet transmission or electronic storage can be guaranteed to be
          completely secure.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "8. Data Retention",
    content: (
      <>
        <p>
          We retain personal information for as long as necessary to provide our services, manage
          customer accounts and orders, resolve disputes, maintain business records and comply with
          applicable legal requirements.
        </p>
        <p>
          When information is no longer required, we take reasonable steps to delete or anonymize
          it, subject to applicable retention obligations.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "9. Your Privacy Rights",
    content: (
      <>
        <p>Subject to applicable laws, you may have the right to:</p>
        <ul>
          <li>Request access to your personal information.</li>
          <li>Request correction of inaccurate or incomplete information.</li>
          <li>Request deletion of personal information where applicable.</li>
          <li>Withdraw consent where processing is based on consent.</li>
          <li>Raise a privacy-related complaint or concern.</li>
        </ul>
        <p>
          To make a privacy request, contact us using the details provided in the Contact Us
          section.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "10. Children's Privacy",
    content: (
      <p>
        Our website is intended for use by individuals who can legally enter into transactions under
        applicable law. We do not knowingly collect personal information directly from children
        without appropriate authorization where required.
      </p>
    ),
  },
  {
    id: "changes",
    title: "11. Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our business
        practices, website features or applicable laws. Updated versions will be published on this
        page with a revised effective date.
      </p>
    ),
  },
  {
    id: "contact",
    title: "12. Contact Us",
    content: (
      <>
        <p>
          If you have questions, concerns or requests relating to this Privacy Policy or your
          personal information, please contact us:
        </p>
        <div className="mt-4 rounded-xl bg-[#FFF1EE] p-5">
          <p className="font-semibold text-[#242424]">YC Gifts & Toys</p>
          <p>Ajmer, Rajasthan, India</p>
          <p>
            Email:{" "}
            <a
              href="mailto:YOUR_SUPPORT_EMAIL"
              className="font-medium text-[#FF5A5F] hover:underline"
            >
              theyourchoicegifts@gmail.com
            </a>
          </p>
        </div>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FFF9F5]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        {/* Page heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFE9E6]">
            <ShieldCheck size={28} className="text-[#FF5A5F]" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#242424] sm:text-4xl">
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6B7280] sm:text-base">
            Your privacy matters to us. Learn how we collect, use and protect your personal
            information.
          </p>

          <p className="mt-4 text-xs font-medium text-[#8B817D]">
            Effective Date: November 14, 2026
          </p>
        </div>

        {/* Intro banner */}
        <div className="mx-auto mt-10 flex max-w-4xl gap-4 rounded-2xl border border-[#F3DAD5] bg-white p-5 sm:p-7">
          <LockKeyhole size={23} className="mt-1 shrink-0 text-[#FF5A5F]" />
          <div>
            <h2 className="font-semibold text-[#242424]">Your trust is important to us</h2>
            <p className="mt-1 text-sm leading-6 text-[#6B7280]">
              We respect your privacy and handle your information responsibly when you shop with YC
              Gifts & Toys.
            </p>
          </div>
        </div>

        {/* Policy content */}
        <div className="mx-auto mt-8 grid max-w-4xl gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Table of contents */}
          <aside className="h-fit rounded-2xl border border-[#EDE9E6] bg-white p-5 lg:sticky lg:top-28">
            <h2 className="mb-4 text-sm font-bold text-[#242424]">On This Page</h2>

            <nav className="flex flex-col gap-3">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-xs leading-5 text-[#6B7280] transition-colors hover:text-[#FF5A5F]"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Policy sections */}
          <div className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-8">
            <div className="space-y-9">
              {policySections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-32">
                  <h2 className="mb-3 text-lg font-bold text-[#242424]">{section.title}</h2>

                  <div className="space-y-3 text-sm leading-7 text-[#625D5A] [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-[#242424] [&_ul]:space-y-2">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom links */}
        <div className="mt-10 text-center text-sm text-[#77716D]">
          <p>Thank you for shopping with YC Gifts & Toys.</p>
          <Link href="/" className="mt-3 inline-flex font-semibold text-[#FF5A5F] hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
