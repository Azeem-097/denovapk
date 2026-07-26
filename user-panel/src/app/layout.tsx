import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { inter, playfair, cormorant } from "@/lib/fonts";
import { ToastContainer }  from "@/components/ui/Toast";
import { TopProgressBar }  from "@/components/ui/TopProgressBar";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { CartAbandonmentTracker } from "@/components/providers/CartAbandonmentTracker";
import { ShippingConfigLoader } from "@/components/providers/ShippingConfigLoader";
import { PaymentConfigLoader } from "@/components/providers/PaymentConfigLoader";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { getSetting } from "@/lib/db/repositories/settings";
import "./globals.css";

const SITE_URL         = "https://denovapk.com";
const SITE_NAME        = "Denova PK";
const SITE_TITLE       = "Denova PK - Premium Denim Clothing";
const SITE_DESCRIPTION = "Premium Denim Clothing - Crafted for the Modern You. Pakistan's finest selvedge jeans and denim apparel. Summer 2026 Collection.";
const OG_IMAGE_URL     = "https://denovapk.com/og-image.jpg";
const OG_IMAGE_ALT     = "Summer 2026 Collection - Crafted for the Modern You";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: ["denim", "jeans", "clothing", "Pakistan", "Denova"],
  authors:  [{ name: SITE_NAME }],
  creator:  SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website", locale: "en_PK", siteName: SITE_NAME,
    url: SITE_URL, title: SITE_TITLE, description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE_URL, secureUrl: OG_IMAGE_URL, width: 1200, height: 630, alt: OG_IMAGE_ALT, type: "image/jpeg" }],
  },
  twitter: {
    card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE_URL, alt: OG_IMAGE_ALT, width: 1200, height: 630 }],
    creator: "@denovapk", site: "@denovapk",
  },
  icons: { icon: [{ url: "/favicon.ico" }], apple: "/apple-touch-icon.png", shortcut: "/favicon.ico" },
  robots: { index: true, follow: true },
  verification: { google: "FExc48j0u82XLNaAQlV6SIFalNE4_t_EGC8mKBAMK_0" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport = { themeColor: "#1a1a1a", width: "device-width", initialScale: 1 };

function sanitizeMetaPixelId(value: string | null): string {
  return (value ?? "").replace(/[^0-9]/g, "");
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [metaPixelEnabled, metaPixelIdRaw] = await Promise.all([
    getSetting("meta_pixel_enabled"),
    getSetting("meta_pixel_id"),
  ]);
  const metaPixelId = sanitizeMetaPixelId(metaPixelIdRaw);
  const shouldLoadMetaPixel = metaPixelEnabled === "true" && metaPixelId.length > 0;

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`}>
      <head>
        <meta property="og:site_name"       content="Denova PK" />
        <meta property="og:type"            content="website" />
        <meta property="og:url"             content="https://denovapk.com" />
        <meta property="og:title"           content="Denova PK - Premium Denim Clothing" />
        <meta property="og:description"     content="Premium Denim Clothing - Crafted for the Modern You. Pakistan's finest selvedge jeans and denim apparel. Summer 2026 Collection." />
        <meta property="og:image"           content="https://denovapk.com/og-image.jpg" />
        <meta property="og:image:secure_url" content="https://denovapk.com/og-image.jpg" />
        <meta property="og:image:type"      content="image/jpeg" />
        <meta property="og:image:width"     content="1200" />
        <meta property="og:image:height"    content="630" />
        <meta property="og:image:alt"       content="Summer 2026 Collection - Crafted for the Modern You" />
        <meta property="og:locale"          content="en_PK" />
        <meta name="twitter:card"           content="summary_large_image" />
        <meta name="twitter:site"           content="@denovapk" />
        <meta name="twitter:creator"        content="@denovapk" />
        <meta name="twitter:image"          content="https://denovapk.com/og-image.jpg" />
        <meta name="thumbnail"              content="https://denovapk.com/og-image.jpg" />
        <meta name="google-site-verification" content="FExc48j0u82XLNaAQlV6SIFalNE4_t_EGC8mKBAMK_0" />
        <meta name="facebook-domain-verification" content="evrz33e08q0iriluy7t5ha4obwocsb" />
      </head>
      <body className="antialiased bg-white text-[#111111]">
        {shouldLoadMetaPixel && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${metaPixelId}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        {/* Top progress bar — must be wrapped in Suspense (uses useSearchParams) */}
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>

        <ScrollProgress />
        <SessionProvider>
          <LayoutShell>{children}</LayoutShell>
          <ToastContainer />

          {/* Background providers - deferred, non-blocking */}
          <CartAbandonmentTracker />
          <ShippingConfigLoader />
          <PaymentConfigLoader />
        </SessionProvider>
      </body>
    </html>
  );
}
