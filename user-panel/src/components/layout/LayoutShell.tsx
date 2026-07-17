"use client";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar }          from "@/components/layout/Navbar";
import { Footer }          from "@/components/layout/Footer";
import { CartDrawer }      from "@/components/cart/CartDrawer";
import { SearchModal }     from "@/components/layout/SearchModal";
import { WhatsAppWidget }  from "@/components/layout/WhatsAppWidget";

// Routes that should render WITHOUT the site chrome
// (their own minimal header lives inside the page)
//
// NOTE: /checkout intentionally excluded — customers should still see
// the full navbar (to escape) and footer (for legal links, etc).
const MINIMAL_ROUTES: string[] = [
  // Add routes here if we need to strip chrome in the future
];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isMinimal = MINIMAL_ROUTES.some((r) =>
    pathname === r || pathname.startsWith(r + "/")
  );

  if (isMinimal) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchModal />
      <WhatsAppWidget />
    </>
  );
}