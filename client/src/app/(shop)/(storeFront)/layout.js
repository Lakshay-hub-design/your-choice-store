import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Navbar from "@/components/storefront/Navbar";
import DesktopNav from "@/components/storefront/DesktopNav";
import MobileBottomNav from "@/components/storefront/MobileBottomNav";
import Footer from "@/components/storefront/footer/Footer";

export default function ShopLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      <header className="sticky top-0 z-50 bg-white">
        <AnnouncementBar />

        <Navbar />

        <DesktopNav />
      </header>

      <main className="pb-20 lg:pb-0">{children}</main>

      <Footer />

      <MobileBottomNav />
    </div>
  );
}
