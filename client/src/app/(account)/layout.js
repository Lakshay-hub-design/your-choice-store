import ProtectedRoute from "@/features/auth/ProtectedRoutes";

export default function AccountLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
