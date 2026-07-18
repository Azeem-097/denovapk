import { Suspense } from "react";
import { getProducts } from "@/lib/db/repositories/products";
import { adaptProduct } from "@/lib/adapters";
import { ShopPageClient } from "./ShopPageClient";

// ISR: 60s cache. Products change occasionally; a 1-minute delay is imperceptible.
export const revalidate = 60;

export default async function ShopPage() {
  const dbProducts = await getProducts({ status: "PUBLISHED", limit: 100 });
  const products   = dbProducts.map(adaptProduct);

  return (
    <Suspense fallback={<div className="pt-32 text-center text-sm text-[#6b7280]">Loading...</div>}>
      <ShopPageClient products={products} />
    </Suspense>
  );
}