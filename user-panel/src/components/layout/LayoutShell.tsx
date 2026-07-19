"use client";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar }          from "@/components/layout/Navbar";
import { Footer }          from "@/components/layout/Footer";
import { CartDrawer }      from "@/components/cart/CartDrawer";
import { SearchModal }     from "@/components/layout/SearchModal";
import { WhatsAppWidget }  from "@/components/layout/WhatsAppWidget";
import { FixedFooterReveal } from "@/components/layout/FixedFooterReveal";

const MINIMAL_ROUTES: string[] = [];

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
      <FixedFooterReveal footer={<Footer />}>
        <AnnouncementBar />
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </FixedFooterReveal>

      <CartDrawer />
      <SearchModal />
      <WhatsAppWidget />
    </>
  );
}