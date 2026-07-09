import { getAllCollections } from "@/lib/db/repositories/collections";
import { NewProductClient } from "./NewProductClient";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const collections = await getAllCollections(false);
  return <NewProductClient collections={collections.map((c) => ({ id: c.id, name: c.name }))} />;
}