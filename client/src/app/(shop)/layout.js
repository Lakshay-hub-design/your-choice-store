import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Navbar from "@/components/storefront/Navbar";
import DesktopNav from "@/components/storefront/DesktopNav";
import MobileBottomNav from "@/components/storefront/MobileBottomNav";

export default function ShopLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      <AnnouncementBar />

      <Navbar />

      <DesktopNav />

      <main className="pb-20 lg:pb-0">{children}</main>

      <MobileBottomNav />
    </div>
  );
}
