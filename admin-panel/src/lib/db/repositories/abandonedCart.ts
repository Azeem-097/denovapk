import { db } from "@/lib/db/client";
import { generateId, now, safeJsonParse } from "@/lib/db/helpers";
import type { DbAbandonedCart, AbandonedCartItem } from "@/lib/db/types";

export interface AbandonedCartWithParsedItems extends DbAbandonedCart {
  items: AbandonedCartItem[];
}

// ─── Create or update abandoned cart ─────────────────────
export interface UpsertAbandonedCartInput {
  userId?:         string | null;
  email?:          string | null;
  phone?:          string | null;
  fullName?:       string | null;
  city?:           string | null;
  items:           AbandonedCartItem[];
  subtotal:        number;
  totalValue:      number;
  reachedCheckout?: boolean;
}

/**
 * Create an abandoned cart, or UPDATE existing one if same user/phone.
 * Match strategy:
 *   1. If userId exists, match by userId
 *   2. Else, match by phone
 *   3. Else, match by email
 *   4. Otherwise, create new
 */
export async function upsertAbandonedCart(input: UpsertAbandonedCartInput): Promise<string> {
  const t = now();

  // Try to find existing (unrecovered) cart for same user/phone/email
  let existing: DbAbandonedCart | null = null;

  if (input.userId) {
    const result = await db.execute({
      sql:  "SELECT * FROM abandoned_carts WHERE userId = ? AND isRecovered = 0 ORDER BY createdAt DESC LIMIT 1",
      args: [input.userId],
    });
    existing = (result.rows[0] as unknown as DbAbandonedCart) ?? null;
  }

  if (!existing && input.phone) {
    const result = await db.execute({
      sql:  "SELECT * FROM abandoned_carts WHERE phone = ? AND isRecovered = 0 ORDER BY createdAt DESC LIMIT 1",
      args: [input.phone],
    });
    existing = (result.rows[0] as unknown as DbAbandonedCart) ?? null;
  }

  if (!existing && input.email) {
    const result = await db.execute({
      sql:  "SELECT * FROM abandoned_carts WHERE email = ? AND isRecovered = 0 ORDER BY createdAt DESC LIMIT 1",
      args: [input.email],
    });
    existing = (result.rows[0] as unknown as DbAbandonedCart) ?? null;
  }

  const itemsJson  = JSON.stringify(input.items);
  const itemCount  = input.items.reduce((sum, i) => sum + i.quantity, 0);
  const reached    = input.reachedCheckout ? 1 : 0;

  if (existing) {
    // Update existing cart
    await db.execute({
      sql: `UPDATE abandoned_carts SET
              userId = COALESCE(?, userId),
              email  = COALESCE(?, email),
              phone  = COALESCE(?, phone),
              fullName = COALESCE(?, fullName),
              city   = COALESCE(?, city),
              itemsJson = ?,
              itemCount = ?,
              subtotal = ?,
              totalValue = ?,
              reachedCheckout = CASE WHEN ? = 1 THEN 1 ELSE reachedCheckout END,
              lastActivity = ?,
              abandonedAt = ?,
              updatedAt = ?
            WHERE id = ?`,
      args: [
        input.userId ?? null, input.email ?? null, input.phone ?? null,
        input.fullName ?? null, input.city ?? null,
        itemsJson, itemCount, input.subtotal, input.totalValue,
        reached, t, t, t, existing.id,
      ],
    });
    return existing.id;
  }

  // Create new cart
  const id = generateId();
  await db.execute({
    sql: `INSERT INTO abandoned_carts (
            id, userId, email, phone, fullName, city,
            itemsJson, itemCount, subtotal, totalValue,
            reachedCheckout, lastActivity, abandonedAt, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, input.userId ?? null, input.email ?? null, input.phone ?? null,
      input.fullName ?? null, input.city ?? null,
      itemsJson, itemCount, input.subtotal, input.totalValue,
      reached, t, t, t, t,
    ],
  });

  return id;
}

// ─── Get all abandoned carts (admin) ─────────────────────
export interface GetAbandonedCartsOptions {
  filter?: "all" | "guest" | "registered" | "checkout" | "recovered";
  search?: string;
  limit?:  number;
  offset?: number;
}

export async function getAbandonedCarts(opts: GetAbandonedCartsOptions = {}): Promise<AbandonedCartWithParsedItems[]> {
  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (opts.filter === "guest")       conditions.push("userId IS NULL");
  if (opts.filter === "registered")  conditions.push("userId IS NOT NULL");
  if (opts.filter === "checkout")    conditions.push("reachedCheckout = 1");
  if (opts.filter === "recovered")   conditions.push("isRecovered = 1");
  if (!opts.filter || opts.filter === "all") {
    conditions.push("isRecovered = 0");
  }

  if (opts.search) {
    conditions.push("(fullName LIKE ? OR email LIKE ? OR phone LIKE ?)");
    const term = `%${opts.search}%`;
    args.push(term, term, term);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.execute({
    sql: `SELECT * FROM abandoned_carts ${where}
          ORDER BY abandonedAt DESC
          ${opts.limit  ? `LIMIT ${opts.limit}`   : ""}
          ${opts.offset ? `OFFSET ${opts.offset}` : ""}`,
    args,
  });

  const carts = result.rows as unknown as DbAbandonedCart[];

  return carts.map((cart) => ({
    ...cart,
    items: safeJsonParse<AbandonedCartItem[]>(cart.itemsJson) ?? [],
  }));
}

// ─── Get single abandoned cart ───────────────────────────
export async function getAbandonedCartById(id: string): Promise<AbandonedCartWithParsedItems | null> {
  const result = await db.execute({
    sql:  "SELECT * FROM abandoned_carts WHERE id = ? LIMIT 1",
    args: [id],
  });
  if (result.rows.length === 0) return null;

  const cart = result.rows[0] as unknown as DbAbandonedCart;
  return {
    ...cart,
    items: safeJsonParse<AbandonedCartItem[]>(cart.itemsJson) ?? [],
  };
}

// ─── Mark cart as contacted ──────────────────────────────
export async function markCartContacted(id: string): Promise<void> {
  await db.execute({
    sql:  "UPDATE abandoned_carts SET isContacted = 1, updatedAt = ? WHERE id = ?",
    args: [now(), id],
  });
}

// ─── Delete abandoned cart ───────────────────────────────
export async function deleteAbandonedCart(id: string): Promise<void> {
  await db.execute({
    sql:  "DELETE FROM abandoned_carts WHERE id = ?",
    args: [id],
  });
}

// ─── Mark as recovered (when customer places order) ──────
export async function markCartRecovered(userId: string | null, phone: string | null, orderId: string): Promise<void> {
  const conditions: string[] = ["isRecovered = 0"];
  const args: (string | number)[] = [];

  if (userId) {
    conditions.push("userId = ?");
    args.push(userId);
  } else if (phone) {
    conditions.push("phone = ?");
    args.push(phone);
  } else {
    return;
  }

  args.push(orderId, now());

  await db.execute({
    sql: `UPDATE abandoned_carts
          SET isRecovered = 1, recoveredOrderId = ?, updatedAt = ?
          WHERE ${conditions.join(" AND ")}`,
    args: [...args.slice(0, args.length - 2), args[args.length - 2], args[args.length - 1]],
  });
}

// ─── Stats for dashboard ─────────────────────────────────
export async function getAbandonedCartStats() {
  const [total, guest, registered, recovered, totalValue] = await Promise.all([
    db.execute("SELECT COUNT(*) as c FROM abandoned_carts WHERE isRecovered = 0"),
    db.execute("SELECT COUNT(*) as c FROM abandoned_carts WHERE isRecovered = 0 AND userId IS NULL"),
    db.execute("SELECT COUNT(*) as c FROM abandoned_carts WHERE isRecovered = 0 AND userId IS NOT NULL"),
    db.execute("SELECT COUNT(*) as c FROM abandoned_carts WHERE isRecovered = 1"),
    db.execute("SELECT COALESCE(SUM(totalValue), 0) as v FROM abandoned_carts WHERE isRecovered = 0"),
  ]);

  return {
    totalAbandoned:  Number(total.rows[0].c),
    guestCarts:      Number(guest.rows[0].c),
    registeredCarts: Number(registered.rows[0].c),
    recovered:       Number(recovered.rows[0].c),
    totalLostValue:  Number(totalValue.rows[0].v),
  };
}