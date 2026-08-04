import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/footer/Footer";

import ProtectedRoute from "@/features/auth/ProtectedRoute";

import AccountSidebar from "@/components/account/AccountSidebar";

export default function AccountLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FFF9F5]">
        <AnnouncementBar />

        <Navbar showCategoryDropdown={false} />

        <main className="min-h-[calc(100vh-200px)]">
          <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <div className="flex items-start gap-6">
              {/* Desktop Sidebar */}
              <AccountSidebar />

              {/* Page Content */}
              <div className="min-w-0 flex-1">{children}</div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
