import ProtectedRoute from "@/features/auth/ProtectedRoute";
import AccountSidebar from "@/components/account/AccountSidebar";

export default function AccountLayout({ children }) {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FFF9F5]">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="flex items-start gap-6">
            {/* Desktop only */}
            <AccountSidebar />

            {/* Page Content */}
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
