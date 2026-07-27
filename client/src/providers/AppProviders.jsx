"use client";

import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import AuthInitializer from "./AuthInitializer";
import CartInitializer from "./CartInitializer";
import WishlistInitializer from "./WishlistInitializer";

export default function AppProviders({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />

      <CartInitializer />

      <WishlistInitializer />

      {children}

      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
