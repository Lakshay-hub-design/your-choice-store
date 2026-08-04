import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Navbar from "@/components/storefront/Navbar";
import MobileBottomNav from "@/components/storefront/MobileBottomNav";

export default function CartLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      <AnnouncementBar />

      <Navbar showCategoryDropdown={false} />

      <main className="pb-20 lg:pb-0">{children}</main>

      <Footer />

      <MobileBottomNav />
    </div>
  );
}
