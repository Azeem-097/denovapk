import { getCollectionsWithCounts } from "@/lib/db/repositories/collections";
import { adaptCollection } from "@/lib/adapters";
import { CollectionsClient } from "./CollectionsClient";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export default async function CollectionsPage() {
  // Admin sees ALL collections (active + inactive)
  const dbCollections = await getCollectionsWithCounts(false);
  const collections   = dbCollections.map(adaptCollection);
  return <CollectionsClient initialCollections={collections} />;
}