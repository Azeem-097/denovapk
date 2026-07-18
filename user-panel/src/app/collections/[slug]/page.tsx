import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/db/repositories/collections";
import { getProducts } from "@/lib/db/repositories/products";
import { adaptProduct } from "@/lib/adapters";
import { CollectionDetailClient } from "./CollectionDetailClient";

// ISR: 60s cache. Collection products refresh every minute.
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const dbProducts = await getProducts({ collectionId: collection.id, limit: 100 });
  const products = dbProducts.map(adaptProduct);

  return (
    <CollectionDetailClient
      collection={{
        id:          collection.id,
        name:        collection.name,
        slug:        collection.slug,
        description: collection.description,
        image:       collection.image ?? "",
      }}
      products={products}
    />
  );
}