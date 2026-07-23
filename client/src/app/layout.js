import "./globals.css";
import AppProviders from "@/providers/AppProviders";
import GoogleMapsProvider from "@/components/google/GoogleMapsProvider";

export const metadata = {
  title: {
    default: "YC Gifts & Toys",
    template: "%s | YC Gifts & Toys",
  },
  description: "Shop gifts, toys and unique products online at YC Gifts & Toys.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <GoogleMapsProvider>{children}</GoogleMapsProvider>
        </AppProviders>
      </body>
    </html>
  );
}
