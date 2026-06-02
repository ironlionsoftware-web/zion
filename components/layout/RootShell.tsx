"use client";

import { usePathname } from "next/navigation";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <PageViewTracker />
      <SkipLink />
      <CartProvider>
        <Header />
        <main id="main-content" className="relative z-10 flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </CartProvider>
    </>
  );
}
