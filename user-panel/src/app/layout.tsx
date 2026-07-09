import type { Metadata } from "next";
import { inter, playfair, cormorant } from "@/lib/fonts";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar }          from "@/components/layout/Navbar";
import { Footer }          from "@/components/layout/Footer";
import { CartDrawer }      from "@/components/cart/CartDrawer";
import { SearchModal }     from "@/components/layout/SearchModal";
import { ToastContainer }  from "@/components/ui/Toast";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default:  `${SITE_NAME} - Premium Clothing`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["clothing", "fashion", "premium", "Pakistan", "Denova", "kurta", "formal", "casual", "lawn"],
  authors:  [{ name: "Denova PK" }],
  creator:  "Denova PK",
  openGraph: {
    type: "website", locale: "en_PK", siteName: SITE_NAME,
    title: `${SITE_NAME} - Premium Clothing`, description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Premium Clothing`, description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`}>
      <body className="antialiased bg-white text-[#111111]">
        <SessionProvider>
          <AnnouncementBar />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CartDrawer />
          <SearchModal />
          <ToastContainer />
        </SessionProvider>
      </body>
    </html>
  );
}