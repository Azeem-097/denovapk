import { db } from "@/lib/db/client";
import { generateId, now } from "@/lib/db/helpers";
import type { DbCart, DbCartItem, DbProduct, DbProductImage, DbProductVariant } from "@/lib/db/types";

export interface CartItemWithDetails extends DbCartItem {
  product: DbProduct & { images: DbProductImage[] };
  variant: DbProductVariant;
}

export interface UserCart {
  id:    string;
  items: CartItemWithDetails[];
}

// ─── Get or create cart for user ─────────────────────────
export async function getOrCreateCart(userId: string): Promise<DbCart> {
  const existing = await db.execute({
    sql:  "SELECT * FROM carts WHERE userId = ? LIMIT 1",
    args: [userId],
  });

  if (existing.rows.length > 0) {
    return existing.rows[0] as unknown as DbCart;
  }

  const cartId = generateId();
  const t = now();
  await db.execute({
    sql:  "INSERT INTO carts (id, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?)",
    args: [cartId, userId, t, t],
  });

  return { id: cartId, userId, createdAt: t, updatedAt: t };
}

// ─── Get cart with all items + product details ───────────
export async function getCartWithItems(userId: string): Promise<UserCart> {
  const cart = await getOrCreateCart(userId);

  const itemsResult = await db.execute({
    sql:  "SELECT * FROM cart_items WHERE cartId = ? ORDER BY createdAt ASC",
    args: [cart.id],
  });

  const items = itemsResult.rows as unknown as DbCartItem[];
  if (items.length === 0) return { id: cart.id, items: [] };

  // Fetch product + variant details
  const productIds = [...new Set(items.map((i) => i.productId))];
  const variantIds = [...new Set(items.map((i) => i.variantId))];

  const pPh = productIds.map(() => "?").join(",");
  const vPh = variantIds.map(() => "?").join(",");

  const [productsResult, variantsResult, imagesResult] = await Promise.all([
    db.execute({ sql: `SELECT * FROM products         WHERE id IN (${pPh})`, args: productIds }),
    db.execute({ sql: `SELECT * FROM product_variants WHERE id IN (${vPh})`, args: variantIds }),
    db.execute({ sql: `SELECT * FROM product_images   WHERE productId IN (${pPh}) AND isPrimary = 1`, args: productIds }),
  ]);

  const products = productsResult.rows as unknown as DbProduct[];
  const variants = variantsResult.rows as unknown as DbProductVariant[];
  const images   = imagesResult.rows   as unknown as DbProductImage[];

  const enrichedItems: CartItemWithDetails[] = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const variant = variants.find((v) => v.id === item.variantId)!;
    const productImages = images.filter((img) => img.productId === item.productId);

    return {
      ...item,
      product: { ...product, images: productImages },
      variant,
    };
  });

  return { id: cart.id, items: enrichedItems };
}

// ─── Add or update item ──────────────────────────────────
export async function addToCart(
  userId:    string,
  productId: string,
  variantId: string,
  quantity:  number
): Promise<void> {
  const cart = await getOrCreateCart(userId);
  const t = now();

  const existing = await db.execute({
    sql:  "SELECT * FROM cart_items WHERE cartId = ? AND variantId = ? LIMIT 1",
    args: [cart.id, variantId],
  });

  if (existing.rows.length > 0) {
    const item = existing.rows[0] as unknown as DbCartItem;
    await db.execute({
      sql:  "UPDATE cart_items SET quantity = quantity + ?, updatedAt = ? WHERE id = ?",
      args: [quantity, t, item.id],
    });
  } else {
    await db.execute({
      sql:  "INSERT INTO cart_items (id, cartId, productId, variantId, quantity, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [generateId(), cart.id, productId, variantId, quantity, t, t],
    });
  }
}

export async function updateCartItemQty(userId: string, itemId: string, quantity: number): Promise<void> {
  const cart = await getOrCreateCart(userId);

  if (quantity <= 0) {
    await db.execute({
      sql:  "DELETE FROM cart_items WHERE id = ? AND cartId = ?",
      args: [itemId, cart.id],
    });
    return;
  }

  await db.execute({
    sql:  "UPDATE cart_items SET quantity = ?, updatedAt = ? WHERE id = ? AND cartId = ?",
    args: [quantity, now(), itemId, cart.id],
  });
}

export async function removeFromCart(userId: string, itemId: string): Promise<void> {
  const cart = await getOrCreateCart(userId);
  await db.execute({
    sql:  "DELETE FROM cart_items WHERE id = ? AND cartId = ?",
    args: [itemId, cart.id],
  });
}

export async function clearCart(userId: string): Promise<void> {
  const cart = await getOrCreateCart(userId);
  await db.execute({
    sql:  "DELETE FROM cart_items WHERE cartId = ?",
    args: [cart.id],
  });
}

/**
 * Merge local (guest) cart into server cart after login.
 * localItems format: [{ productId, variantId, quantity }]
 */
export async function mergeGuestCart(
  userId:     string,
  localItems: Array<{ productId: string; variantId: string; quantity: number }>
): Promise<void> {
  if (localItems.length === 0) return;

  for (const item of localItems) {
    await addToCart(userId, item.productId, item.variantId, item.quantity);
  }
}