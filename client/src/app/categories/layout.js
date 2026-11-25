import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/footer/Footer";
import MobileBottomNav from "@/components/storefront/MobileBottomNav";

export default function CategoriesLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white">
        <AnnouncementBar />
        <Navbar showCategoryDropdown={false} />
      </header>

      {/* Page Content */}
      <main className="min-h-[calc(100vh-200px)] pb-20 lg:pb-0">{children}</main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
