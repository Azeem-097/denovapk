import { getProducts } from "@/lib/db/repositories/products";
import { adaptProduct } from "@/lib/adapters";
import { ProductsPageClient } from "./ProductsPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage() {
  const dbProducts = await getProducts({ status: "ALL", limit: 200 });
  const products   = dbProducts.map(adaptProduct);

  return <ProductsPageClient initialProducts={products} />;
}