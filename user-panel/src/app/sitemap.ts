import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/db/repositories/products";

const SITE_URL = "https://denovapk.com";

const staticRoutes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/",           priority: 1,    changeFrequency: "daily" },
  { path: "/shop",       priority: 0.95, changeFrequency: "daily" },
  { path: "/about",      priority: 0.6,  changeFrequency: "monthly" },
  { path: "/contact",    priority: 0.6,  changeFrequency: "monthly" },
  { path: "/shipping",   priority: 0.5,  changeFrequency: "monthly" },
  { path: "/returns",    priority: 0.5,  changeFrequency: "monthly" },
  { path: "/size-guide", priority: 0.5,  changeFrequency: "monthly" },
  { path: "/privacy",    priority: 0.3,  changeFrequency: "yearly" },
  { path: "/terms",      priority: 0.3,  changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getProducts({ status: "PUBLISHED", limit: 500 });

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt * 1000),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
  ];
}
