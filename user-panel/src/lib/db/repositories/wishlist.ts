import { db } from "@/lib/db/client";
import { generateId, now } from "@/lib/db/helpers";
import type { DbWishlist, DbProduct, DbProductImage } from "@/lib/db/types";

export interface WishlistItemWithProduct extends DbWishlist {
  product: DbProduct & { images: DbProductImage[] };
}

export async function getWishlist(userId: string): Promise<WishlistItemWithProduct[]> {
  const result = await db.execute({
    sql: `SELECT w.*, p.*
          FROM wishlists w
          INNER JOIN products p ON p.id = w.productId
          WHERE w.userId = ?
          ORDER BY w.createdAt DESC`,
    args: [userId],
  });

  if (result.rows.length === 0) return [];

  const items = result.rows as unknown as (DbWishlist & DbProduct)[];
  const productIds = items.map((i) => i.productId);
  const placeholders = productIds.map(() => "?").join(",");

  const imgResult = await db.execute({
    sql:  `SELECT * FROM product_images WHERE productId IN (${placeholders}) AND isPrimary = 1`,
    args: productIds,
  });
  const images = imgResult.rows as unknown as DbProductImage[];

  return items.map((item) => ({
    id:        item.id,
    userId:    item.userId,
    productId: item.productId,
    createdAt: item.createdAt,
    product: {
      ...(item as unknown as DbProduct),
      images: images.filter((i) => i.productId === item.productId),
    },
  }));
}

export async function addToWishlist(userId: string, productId: string): Promise<void> {
  const existing = await db.execute({
    sql:  "SELECT id FROM wishlists WHERE userId = ? AND productId = ? LIMIT 1",
    args: [userId, productId],
  });
  if (existing.rows.length > 0) return;

  await db.execute({
    sql:  "INSERT INTO wishlists (id, userId, productId, createdAt) VALUES (?, ?, ?, ?)",
    args: [generateId(), userId, productId, now()],
  });
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  await db.execute({
    sql:  "DELETE FROM wishlists WHERE userId = ? AND productId = ?",
    args: [userId, productId],
  });
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  const result = await db.execute({
    sql:  "SELECT id FROM wishlists WHERE userId = ? AND productId = ? LIMIT 1",
    args: [userId, productId],
  });
  return result.rows.length > 0;
}

export async function clearWishlist(userId: string): Promise<void> {
  await db.execute({ sql: "DELETE FROM wishlists WHERE userId = ?", args: [userId] });
}