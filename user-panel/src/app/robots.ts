import type { MetadataRoute } from "next";

const SITE_URL = "https://denovapk.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account/", "/cart", "/checkout", "/search", "/wishlist"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
