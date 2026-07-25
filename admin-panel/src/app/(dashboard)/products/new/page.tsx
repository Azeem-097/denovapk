import { NewProductClient } from "./NewProductClient";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  return <NewProductClient collections={[]} />;
}
