import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/db/repositories/products";
import { getAllCollections } from "@/lib/db/repositories/collections";

const SITE_URL = "https://denovapk.com";

const staticRoutes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/",           priority: 1,    changeFrequency: "daily" },
  { path: "/shop",       priority: 0.95, changeFrequency: "daily" },
  { path: "/contact",    priority: 0.6,  changeFrequency: "monthly" },
  { path: "/about",      priority: 0.55, changeFrequency: "monthly" },
  { path: "/collections", priority: 0.8, changeFrequency: "daily" },
  { path: "/faq",        priority: 0.45, changeFrequency: "monthly" },
  { path: "/track-order", priority: 0.35, changeFrequency: "monthly" },
  { path: "/careers",    priority: 0.25, changeFrequency: "monthly" },
  { path: "/shipping",   priority: 0.5,  changeFrequency: "monthly" },
  { path: "/returns",    priority: 0.5,  changeFrequency: "monthly" },
  { path: "/size-guide", priority: 0.5,  changeFrequency: "monthly" },
  { path: "/privacy",    priority: 0.3,  changeFrequency: "yearly" },
  { path: "/terms",      priority: 0.3,  changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([
    getProducts({ status: "PUBLISHED", limit: 500 }),
    getAllCollections(true),
  ]);

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...collections.map((collection) => ({
      url: `${SITE_URL}/collections/${collection.slug}`,
      lastModified: new Date(collection.updatedAt * 1000),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt * 1000),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
  ];
}
