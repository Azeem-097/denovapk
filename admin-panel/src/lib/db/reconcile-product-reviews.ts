/**
 * Recalculate product rating and reviewCount from approved review records.
 * Run with: npm run db:reconcile-reviews
 */

import "dotenv/config";
import { createClient } from "@libsql/client";

async function reconcile() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("Missing TURSO_DATABASE_URL in .env");

  const db = createClient({ url, authToken });

  await db.execute(`
    UPDATE products
    SET
      rating = COALESCE((
        SELECT ROUND(AVG(rating), 2)
        FROM reviews
        WHERE reviews.productId = products.id AND reviews.isApproved = 1
      ), 0),
      reviewCount = COALESCE((
        SELECT COUNT(*)
        FROM reviews
        WHERE reviews.productId = products.id AND reviews.isApproved = 1
      ), 0),
      updatedAt = unixepoch()
  `);

  console.log("Product review aggregates reconciled from approved reviews.");
}

reconcile().catch((err) => {
  console.error("Review reconciliation failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
