import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/repositories/products";
import { adaptProduct } from "@/lib/adapters";
import { ProductDetailClient } from "./ProductDetailClient";

// ISR: 60s cache. Stock levels update within 1 minute for browsing users.
// (Real stock validation happens at checkout — this is safe.)
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

// Placeholder image shown when a product has no images uploaded yet
const PLACEHOLDER_IMAGE = {
  id:        "placeholder",
  url:       "/uploads/placeholder.svg",
  alt:       "Product image coming soon",
  isPrimary: true,
};

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let dbProduct;
  try {
    dbProduct = await getProductBySlug(slug);
  } catch (err) {
    console.error("Failed to load product:", err);
    notFound();
  }

  if (!dbProduct) notFound();

  const product = adaptProduct(dbProduct);

  // Ensure we always have at least one image so the UI never crashes
  if (product.images.length === 0) {
    product.images = [PLACEHOLDER_IMAGE];
  }

  let relatedProducts: ReturnType<typeof adaptProduct>[] = [];
  try {
    if (dbProduct.collectionId) {
      const dbRelated = await getRelatedProducts(dbProduct.id, dbProduct.collectionId, 4);
      relatedProducts = dbRelated.map((p) => {
        const adapted = adaptProduct({ ...p, collection: dbProduct.collection });
        if (adapted.images.length === 0) adapted.images = [PLACEHOLDER_IMAGE];
        return adapted;
      });
    }
  } catch (err) {
    console.error("Failed to load related products:", err);
  }

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}