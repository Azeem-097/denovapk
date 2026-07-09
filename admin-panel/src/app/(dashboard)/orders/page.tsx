import { getAllOrders } from "@/lib/db/repositories/orders";
import { adaptOrder } from "@/lib/adapters";
import { OrdersPageClient } from "./OrdersPageClient";
import { db } from "@/lib/db/client";
import type { DbUser } from "@/lib/db/types";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export default async function OrdersPage() {
  const dbOrders = await getAllOrders({ limit: 200 });

  // Fetch user names for orders that have userId
  const userIds = dbOrders.map((o) => o.userId).filter(Boolean) as string[];
  let usersMap = new Map<string, DbUser>();

  if (userIds.length > 0) {
    const placeholders = userIds.map(() => "?").join(",");
    const result = await db.execute({
      sql:  `SELECT * FROM users WHERE id IN (${placeholders})`,
      args: userIds,
    });
    const users = result.rows as unknown as DbUser[];
    usersMap = new Map(users.map((u) => [u.id, u]));
  }

  const orders = dbOrders.map((o) => {
    const user = o.userId ? usersMap.get(o.userId) : null;
    return adaptOrder(o, user?.name ?? "", user?.email ?? "", user?.phone ?? "");
  });

  return <OrdersPageClient initialOrders={orders} />;
}