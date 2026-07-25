import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts } from "@/lib/db/repositories/products";
import { adaptProduct } from "@/lib/adapters";
import { ShopPageClient } from "./ShopPageClient";

// ISR: 60s cache. Products change occasionally; a 1-minute delay is imperceptible.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop Premium Denim Jeans",
  description: "Shop Denova PK premium denim jeans in Pakistan. Explore selvedge, cargo, straight fit, and handcrafted denim styles.",
  alternates: { canonical: "https://denovapk.com/shop" },
  robots: { index: true, follow: true },
};

export default async function ShopPage() {
  const dbProducts = await getProducts({ status: "PUBLISHED", limit: 100 });
  const products   = dbProducts.map(adaptProduct);

  return (
    <Suspense fallback={<div className="pt-32 text-center text-sm text-[#6b7280]">Loading...</div>}>
      <ShopPageClient products={products} />
    </Suspense>
  );
}
