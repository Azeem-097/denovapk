import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/repositories/products";
import { adaptProduct } from "@/lib/adapters";
import { ProductDetailClient } from "./ProductDetailClient";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const dbProduct = await getProductBySlug(slug);
  if (!dbProduct) notFound();

  const product = adaptProduct(dbProduct);

  const dbRelated = dbProduct.collectionId
    ? await getRelatedProducts(dbProduct.id, dbProduct.collectionId, 4)
    : [];

  const relatedProducts = dbRelated.map((p) =>
    adaptProduct({ ...p, collection: dbProduct.collection })
  );

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}