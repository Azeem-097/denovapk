import { notFound } from "next/navigation";
import { getProductById } from "@/lib/db/repositories/products";
import { getAllCollections } from "@/lib/db/repositories/collections";
import { EditProductClient } from "./EditProductClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const dbProduct = await getProductById(id);
  if (!dbProduct) notFound();

  const collections = await getAllCollections(false);

  // Turso returns Row objects (with methods), which cannot cross the
  // server -> client boundary. JSON round-trip serializes them into
  // plain objects that React can safely pass.
  const plainProduct     = JSON.parse(JSON.stringify(dbProduct));
  const plainCollections = collections.map((c) => ({ id: c.id, name: c.name }));

  return (
    <EditProductClient
      product={plainProduct}
      collections={plainCollections}
    />
  );
}