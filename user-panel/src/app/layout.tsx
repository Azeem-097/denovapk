import type { Metadata } from "next";
import { inter, playfair, cormorant } from "@/lib/fonts";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar }          from "@/components/layout/Navbar";
import { Footer }          from "@/components/layout/Footer";
import { CartDrawer }      from "@/components/cart/CartDrawer";
import { SearchModal }     from "@/components/layout/SearchModal";
import { ToastContainer }  from "@/components/ui/Toast";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

// ══════════════════════════════════════════════════════════
// CRITICAL: Hardcoded to avoid env var issues in production
// ══════════════════════════════════════════════════════════
const SITE_URL         = "https://denovapk.com";
const SITE_NAME        = "Denova PK";
const SITE_TITLE       = "Denova PK - Premium Denim Clothing";
const SITE_DESCRIPTION = "Premium Denim Clothing - Crafted for the Modern You. Pakistan's finest selvedge jeans and denim apparel. Summer 2026 Collection.";
const OG_IMAGE_URL     = "https://denovapk.com/og-image.png";
const OG_IMAGE_ALT     = "Summer 2026 Collection - Crafted for the Modern You";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "denim", "jeans", "clothing", "fashion", "premium",
    "Pakistan", "Denova", "denim pants", "selvedge",
    "raw denim", "denovapk", "premium denim Pakistan",
    "summer 2026", "denim collection",
  ],
  authors:  [{ name: SITE_NAME }],
  creator:  SITE_NAME,
  publisher: SITE_NAME,

  openGraph: {
    type:        "website",
    locale:      "en_PK",
    siteName:    SITE_NAME,
    url:         SITE_URL,
    title:       SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url:       OG_IMAGE_URL,
        secureUrl: OG_IMAGE_URL,
        width:     1200,
        height:    630,
        alt:       OG_IMAGE_ALT,
        type:      "image/png",
      },
    ],
  },

  twitter: {
    card:        "summary_large_image",
    title:       SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url:    OG_IMAGE_URL,
        alt:    OG_IMAGE_ALT,
        width:  1200,
        height: 630,
      },
    ],
    creator: "@denovapk",
    site:    "@denovapk",
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
    ],
    apple:    "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },

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

  formatDetection: {
    telephone: false,
    email:     false,
    address:   false,
  },
};

export const viewport = {
  themeColor: "#1a1a1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`}>
      <head>
        {/* ═══════════════════════════════════════════════════════════
            FORCED OG META TAGS - These override any auto-detection
            HARDCODED to guarantee they never fall back to localhost
            ═══════════════════════════════════════════════════════════ */}

        {/* Open Graph */}
        <meta property="og:site_name"       content="Denova PK" />
        <meta property="og:type"            content="website" />
        <meta property="og:url"             content="https://denovapk.com" />
        <meta property="og:title"           content="Denova PK - Premium Denim Clothing" />
        <meta property="og:description"     content="Premium Denim Clothing - Crafted for the Modern You. Pakistan's finest selvedge jeans and denim apparel. Summer 2026 Collection." />
        <meta property="og:image"           content="https://denovapk.com/og-image.png" />
        <meta property="og:image:secure_url" content="https://denovapk.com/og-image.png" />
        <meta property="og:image:type"      content="image/png" />
        <meta property="og:image:width"     content="1200" />
        <meta property="og:image:height"    content="630" />
        <meta property="og:image:alt"       content="Summer 2026 Collection - Crafted for the Modern You" />
        <meta property="og:locale"          content="en_PK" />

        {/* Twitter Card */}
        <meta name="twitter:card"           content="summary_large_image" />
        <meta name="twitter:site"           content="@denovapk" />
        <meta name="twitter:creator"        content="@denovapk" />
        <meta name="twitter:title"          content="Denova PK - Premium Denim Clothing" />
        <meta name="twitter:description"    content="Premium Denim Clothing - Crafted for the Modern You. Pakistan's finest selvedge jeans and denim apparel. Summer 2026 Collection." />
        <meta name="twitter:image"          content="https://denovapk.com/og-image.png" />
        <meta name="twitter:image:alt"      content="Summer 2026 Collection - Crafted for the Modern You" />
      </head>
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