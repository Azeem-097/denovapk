import { db } from "@/lib/db/client";
import type { DbDiscount } from "@/lib/db/types";
import { DiscountsClient } from "./DiscountsClient";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export default async function DiscountsPage() {
  const result = await db.execute("SELECT * FROM discounts ORDER BY createdAt DESC");

  // Convert Row objects to plain objects (required for Server → Client serialization)
  const discounts = result.rows.map((row) => ({
    id:        row.id        as string,
    code:      row.code      as string,
    type:      row.type      as string,
    value:     Number(row.value),
    minOrder:  Number(row.minOrder),
    maxUses:   Number(row.maxUses),
    usedCount: Number(row.usedCount),
    status:    row.status    as string,
    startsAt:  Number(row.startsAt),
    expiresAt: Number(row.expiresAt),
    createdAt: Number(row.createdAt),
    updatedAt: Number(row.updatedAt),
  })) as DbDiscount[];

  return <DiscountsClient initialDiscounts={discounts} />;
}