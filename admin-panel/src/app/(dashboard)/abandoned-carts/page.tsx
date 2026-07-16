import { getAbandonedCarts, getAbandonedCartStats } from "@/lib/db/repositories/abandonedCart";
import { getSetting } from "@/lib/db/repositories/settings";
import { AbandonedCartsClient } from "./AbandonedCartsClient";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export default async function AbandonedCartsPage() {
  const [carts, stats, waMessage] = await Promise.all([
    getAbandonedCarts({ filter: "all", limit: 200 }),
    getAbandonedCartStats(),
    getSetting("abandoned_cart_wa_message"),
  ]);

  return (
    <AbandonedCartsClient
      initialCarts={carts}
      initialStats={stats}
      waMessageTemplate={waMessage ?? ""}
    />
  );
}