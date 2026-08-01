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

export class CartStockError extends Error {
  stock: number;

  constructor(stock: number) {
    super(stock > 0 ? `Only ${stock} items are available in stock.` : "This item is out of stock.");
    this.name = "CartStockError";
    this.stock = stock;
  }
}

export class CartSoldOutError extends Error {
  constructor() {
    super("This product is sold out and can no longer be purchased.");
    this.name = "CartSoldOutError";
  }
}

let soldOutColumnReady: Promise<void> | null = null;

async function ensureSoldOutColumn(): Promise<void> {
  if (!soldOutColumnReady) {
    soldOutColumnReady = (async () => {
      const result = await db.execute({ sql: "PRAGMA table_info(products);", args: [] });
      const exists = result.rows.some((row) => (row.name as string) === "isSoldOut");
      if (!exists) {
        try {
          await db.execute({ sql: "ALTER TABLE products ADD COLUMN isSoldOut INTEGER NOT NULL DEFAULT 0;", args: [] });
        } catch (error) {
          if (!(error instanceof Error) || !error.message.includes("duplicate column name: isSoldOut")) throw error;
        }
      }
    })().catch((error) => {
      soldOutColumnReady = null;
      throw error;
    });
  }
  return soldOutColumnReady;
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

  return { id: cartId, userId, lastActivity: t, createdAt: t, updatedAt: t };
}

// ─── Get cart with all items + product details ───────────
export async function getCartWithItems(userId: string): Promise<UserCart> {
  await ensureSoldOutColumn();
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
  await ensureSoldOutColumn();
  const cart = await getOrCreateCart(userId);
  const t = now();
  const requestedQty = Math.max(1, Math.floor(Number(quantity) || 1));
  const availability = await getVariantAvailability(variantId, productId);
  if (availability.isSoldOut) throw new CartSoldOutError();
  const stock = availability.stock;

  const existing = await db.execute({
    sql:  "SELECT * FROM cart_items WHERE cartId = ? AND variantId = ? LIMIT 1",
    args: [cart.id, variantId],
  });

  if (existing.rows.length > 0) {
    const item = existing.rows[0] as unknown as DbCartItem;
    const nextQty = item.quantity + requestedQty;
    if (nextQty > stock) throw new CartStockError(stock);
    await db.execute({
      sql:  "UPDATE cart_items SET quantity = quantity + ?, updatedAt = ? WHERE id = ?",
      args: [requestedQty, t, item.id],
    });
  } else {
    if (requestedQty > stock) throw new CartStockError(stock);
    await db.execute({
      sql:  "INSERT INTO cart_items (id, cartId, productId, variantId, quantity, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [generateId(), cart.id, productId, variantId, requestedQty, t, t],
    });
  }
}

export async function updateCartItemQty(userId: string, itemId: string, quantity: number): Promise<void> {
  await ensureSoldOutColumn();
  const cart = await getOrCreateCart(userId);

  if (quantity <= 0) {
    await db.execute({
      sql:  "DELETE FROM cart_items WHERE id = ? AND cartId = ?",
      args: [itemId, cart.id],
    });
    return;
  }

  const current = await db.execute({
    sql:  "SELECT variantId FROM cart_items WHERE id = ? AND cartId = ? LIMIT 1",
    args: [itemId, cart.id],
  });
  if (current.rows.length === 0) return;

  const item = current.rows[0] as unknown as DbCartItem;
  const availability = await getVariantAvailability(item.variantId, item.productId);
  if (availability.isSoldOut) throw new CartSoldOutError();
  const stock = availability.stock;
  const requestedQty = Math.max(1, Math.floor(Number(quantity) || 1));
  if (requestedQty > stock) throw new CartStockError(stock);

  await db.execute({
    sql:  "UPDATE cart_items SET quantity = ?, updatedAt = ? WHERE id = ? AND cartId = ?",
    args: [requestedQty, now(), itemId, cart.id],
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

async function getVariantAvailability(
  variantId: string,
  productId?: string
): Promise<{ stock: number; isSoldOut: boolean }> {
  const result = await db.execute({
    sql:  `SELECT v.stock, p.isSoldOut
           FROM product_variants v
           JOIN products p ON p.id = v.productId
           WHERE v.id = ? ${productId ? "AND p.id = ?" : ""} LIMIT 1`,
    args: productId ? [variantId, productId] : [variantId],
  });

  if (result.rows.length === 0) throw new CartStockError(0);
  return {
    stock: Math.max(0, Math.floor(Number(result.rows[0].stock) || 0)),
    isSoldOut: Number(result.rows[0].isSoldOut ?? 0) === 1,
  };
}
