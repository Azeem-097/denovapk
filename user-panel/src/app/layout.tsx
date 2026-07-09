import type { Metadata } from "next";
import { inter, playfair, cormorant } from "@/lib/fonts";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar }          from "@/components/layout/Navbar";
import { Footer }          from "@/components/layout/Footer";
import { CartDrawer }      from "@/components/cart/CartDrawer";
import { SearchModal }     from "@/components/layout/SearchModal";
import { ToastContainer }  from "@/components/ui/Toast";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  `${SITE_NAME} - Premium Denim Clothing`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "denim", "jeans", "clothing", "fashion", "premium",
    "Pakistan", "Denova", "denim pants", "selvedge",
    "raw denim", "denovapk", "premium denim Pakistan",
  ],
  authors:  [{ name: "Denova PK" }],
  creator:  "Denova PK",
  publisher: "Denova PK",

  // ─── Open Graph (Facebook, LinkedIn, WhatsApp, Discord) ─
  openGraph: {
    type:        "website",
    locale:      "en_PK",
    siteName:    SITE_NAME,
    url:         SITE_URL,
    title:       `${SITE_NAME} - Premium Denim Clothing`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url:    "/og-image.png",
        width:  1200,
        height: 630,
        alt:    "Denova PK - Premium Denim Collection",
        type:   "image/png",
      },
    ],
  },

  // ─── Twitter / X Card ───────────────────────────────────
  twitter: {
    card:        "summary_large_image",
    title:       `${SITE_NAME} - Premium Denim Clothing`,
    description: SITE_DESCRIPTION,
    images:      ["/og-image.png"],
    creator:     "@denovapk",
    site:        "@denovapk",
  },

  // ─── Icons ──────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple:    "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },

  // ─── SEO ────────────────────────────────────────────────
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:                true,
      follow:               true,
      "max-video-preview":  -1,
      "max-image-preview":  "large",
      "max-snippet":        -1,
    },
  },

  // ─── Verification (add later when you set up) ───────────
  // verification: {
  //   google: "your-google-site-verification-code",
  //   yandex: "your-yandex-verification-code",
  // },
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