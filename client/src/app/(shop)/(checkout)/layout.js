import CheckoutNavbar from "@/components/storefront/CheckoutNavbar";

export default function CheckoutLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      <CheckoutNavbar />

      <main>{children}</main>
    </div>
  );
}
