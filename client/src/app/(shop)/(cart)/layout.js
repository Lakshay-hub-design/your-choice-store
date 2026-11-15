import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Navbar from "@/components/storefront/Navbar";
import MobileBottomNav from "@/components/storefront/MobileBottomNav";
import Footer from "@/components/storefront/footer/Footer";

export default function CartLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      <header className="sticky top-0 z-50 bg-white">
        <AnnouncementBar />

        <Navbar showCategoryDropdown={false} />
      </header>

      <main className="pb-20 lg:pb-0">{children}</main>

      <Footer />

      <MobileBottomNav />
    </div>
  );
}
