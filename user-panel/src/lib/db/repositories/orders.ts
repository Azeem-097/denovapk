import { db } from "@/lib/db/client";
import { generateId, now, generateOrderNumber } from "@/lib/db/helpers";
import type {
  DbOrder, DbOrderItem, DbAddress, OrderStatus, PaymentStatus, PaymentMethod,
} from "@/lib/db/types";

export interface OrderWithItems extends DbOrder {
  items:   DbOrderItem[];
  address: DbAddress | null;
}

// ─── Get orders for a user ───────────────────────────────
export async function getUserOrders(userId: string): Promise<OrderWithItems[]> {
  const result = await db.execute({
    sql:  "SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC",
    args: [userId],
  });

  const orders = result.rows as unknown as DbOrder[];
  if (orders.length === 0) return [];

  return await enrichOrdersWithRelations(orders);
}

// ─── Get single order ────────────────────────────────────
export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const result = await db.execute({
    sql:  "SELECT * FROM orders WHERE id = ? LIMIT 1",
    args: [id],
  });
  if (result.rows.length === 0) return null;

  const [order] = await enrichOrdersWithRelations([result.rows[0] as unknown as DbOrder]);
  return order;
}

export async function getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
  const result = await db.execute({
    sql:  "SELECT * FROM orders WHERE orderNumber = ? LIMIT 1",
    args: [orderNumber],
  });
  if (result.rows.length === 0) return null;

  const [order] = await enrichOrdersWithRelations([result.rows[0] as unknown as DbOrder]);
  return order;
}

// ─── All orders (admin) ──────────────────────────────────
export interface GetAllOrdersOptions {
  status?: OrderStatus | "ALL";
  search?: string;
  limit?:  number;
  offset?: number;
}

export async function getAllOrders(opts: GetAllOrdersOptions = {}): Promise<OrderWithItems[]> {
  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (opts.status && opts.status !== "ALL") {
    conditions.push("status = ?");
    args.push(opts.status);
  }

  if (opts.search) {
    conditions.push("(orderNumber LIKE ? OR guestEmail LIKE ? OR guestName LIKE ?)");
    const term = `%${opts.search}%`;
    args.push(term, term, term);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.execute({
    sql:  `SELECT * FROM orders ${where} ORDER BY createdAt DESC ${opts.limit ? `LIMIT ${opts.limit}` : ""} ${opts.offset ? `OFFSET ${opts.offset}` : ""}`,
    args,
  });

  const orders = result.rows as unknown as DbOrder[];
  if (orders.length === 0) return [];

  return await enrichOrdersWithRelations(orders);
}

// ─── Create order ────────────────────────────────────────
export interface CreateOrderInput {
  userId?:      string | null;
  guestEmail?:  string;
  guestName?:   string;
  guestPhone?:  string;
  items: Array<{
    productId: string;
    variantId: string;
    name:      string;
    image:     string;
    size:      string;
    color:     string;
    sku:       string;
    price:     number;
    quantity:  number;
  }>;
  subtotal:       number;
  discount?:      number;
  shipping:       number;
  tax?:           number;
  total:          number;
  paymentMethod:  PaymentMethod;
  addressId?:     string | null;
  shippingAddress?: object;
  shippingMethod: string;
  customerNote?:  string;
  discountCode?:  string;
  discountId?:    string;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderWithItems> {
  await validateOrderItemsAvailable(input.items);

  const orderId    = generateId();
  // Generate unique order number (retry up to 10 times on collision)
  let orderNum = generateOrderNumber();
  for (let attempt = 0; attempt < 10; attempt++) {
    const existing = await db.execute({
      sql:  "SELECT id FROM orders WHERE orderNumber = ? LIMIT 1",
      args: [orderNum],
    });
    if (existing.rows.length === 0) break; // unique
    orderNum = generateOrderNumber();
    if (attempt === 9) {
      // Last resort: append random suffix
      orderNum = `${orderNum}-${Math.floor(Math.random() * 100)}`;
    }
  }
  const t          = now();

  await db.execute("BEGIN IMMEDIATE");
  try {
    await db.execute({
      sql: `INSERT INTO orders (
        id, orderNumber, userId, guestEmail, guestName, guestPhone,
        subtotal, discount, shipping, tax, total,
        status, paymentStatus, paymentMethod,
        discountCode, discountId, addressId, shippingAddress,
        shippingMethod, customerNote, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        orderId, orderNum, input.userId ?? null,
        input.guestEmail ?? null, input.guestName ?? null, input.guestPhone ?? null,
        input.subtotal, input.discount ?? 0, input.shipping, input.tax ?? 0, input.total,
        "PENDING", input.paymentMethod === "COD" ? "PENDING" : "PENDING", input.paymentMethod,
        input.discountCode ?? null, input.discountId ?? null,
        input.addressId ?? null,
        input.shippingAddress ? JSON.stringify(input.shippingAddress) : null,
        input.shippingMethod, input.customerNote ?? null,
        t, t,
      ],
    });

    for (const item of input.items) {
      const stockUpdate = await db.execute({
        sql:  "UPDATE product_variants SET stock = stock - ?, updatedAt = ? WHERE id = ? AND stock >= ?",
        args: [item.quantity, t, item.variantId, item.quantity],
      });
      if (stockUpdate.rowsAffected !== 1) {
        throw new Error("One or more items in your cart are out of stock.");
      }

      await db.execute({
        sql: `INSERT INTO order_items (
          id, orderId, productId, variantId, name, image, size, color, sku, price, quantity, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          generateId(), orderId, item.productId, item.variantId,
          item.name, item.image, item.size, item.color, item.sku,
          item.price, item.quantity, item.price * item.quantity,
        ],
      });

      await db.execute({
        sql:  "UPDATE products SET soldCount = soldCount + ? WHERE id = ?",
        args: [item.quantity, item.productId],
      });
    }

    if (input.discountId) {
      await db.execute({
        sql:  "UPDATE discounts SET usedCount = usedCount + 1 WHERE id = ?",
        args: [input.discountId],
      });
    }

    await db.execute("COMMIT");
  } catch (error) {
    await db.execute("ROLLBACK");
    throw error;
  }

  return (await getOrderById(orderId))!;
}

async function validateOrderItemsAvailable(inputItems: CreateOrderInput["items"]): Promise<void> {
  const requestedByVariant = new Map<string, number>();
  for (const item of inputItems) {
    requestedByVariant.set(item.variantId, (requestedByVariant.get(item.variantId) ?? 0) + item.quantity);
  }

  if (requestedByVariant.size === 0) throw new Error("Your cart is empty.");

  const variantIds = [...requestedByVariant.keys()];
  const placeholders = variantIds.map(() => "?").join(",");
  const result = await db.execute({
    sql:  `SELECT v.id, v.stock, p.isSoldOut
           FROM product_variants v
           JOIN products p ON p.id = v.productId
           WHERE v.id IN (${placeholders})`,
    args: variantIds,
  });

  const rowsByVariant = new Map(result.rows.map((row) => [String(row.id), row]));
  for (const [variantId, quantity] of requestedByVariant) {
    const row = rowsByVariant.get(variantId);
    if (!row) throw new Error("One or more items in your cart are unavailable.");
    if (Number(row.isSoldOut ?? 0) === 1) {
      throw new Error("This product is sold out and can no longer be purchased.");
    }
    const stock = Math.max(0, Math.floor(Number(row.stock) || 0));
    if (quantity > stock) {
      throw new Error(stock > 0 ? `Only ${stock} items are available in stock.` : "One or more items in your cart are out of stock.");
    }
  }
}

// ─── Update order status ─────────────────────────────────
export async function updateOrderStatus(
  id: string, status: OrderStatus, trackingNumber?: string
): Promise<void> {
  const t = now();
  const sets: string[] = ["status = ?", "updatedAt = ?"];
  const args: (string | number)[] = [status, t];

  // Set status-specific timestamps
  if (status === "CONFIRMED") { sets.push("confirmedAt = ?"); args.push(t); }
  if (status === "SHIPPED")   { sets.push("shippedAt = ?");   args.push(t); }
  if (status === "DELIVERED") { sets.push("deliveredAt = ?"); args.push(t); }
  if (status === "CANCELLED") { sets.push("cancelledAt = ?"); args.push(t); }

  if (trackingNumber !== undefined) {
    sets.push("trackingNumber = ?");
    args.push(trackingNumber);
  }

  args.push(id);

  await db.execute({
    sql:  `UPDATE orders SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
}

export async function updatePaymentStatus(id: string, status: PaymentStatus): Promise<void> {
  await db.execute({
    sql:  "UPDATE orders SET paymentStatus = ?, updatedAt = ? WHERE id = ?",
    args: [status, now(), id],
  });
}

// ─── Helper: enrich orders with items + address ─────────
async function enrichOrdersWithRelations(orders: DbOrder[]): Promise<OrderWithItems[]> {
  const orderIds   = orders.map((o) => o.id);
  const placeholders = orderIds.map(() => "?").join(",");

  const itemsResult = await db.execute({
    sql:  `SELECT * FROM order_items WHERE orderId IN (${placeholders})`,
    args: orderIds,
  });
  const items = itemsResult.rows as unknown as DbOrderItem[];

  // Fetch addresses for orders that have addressId
  const addressIds = orders.map((o) => o.addressId).filter(Boolean) as string[];
  let addresses: DbAddress[] = [];
  if (addressIds.length > 0) {
    const addrPlaceholders = addressIds.map(() => "?").join(",");
    const addrResult = await db.execute({
      sql:  `SELECT * FROM addresses WHERE id IN (${addrPlaceholders})`,
      args: addressIds,
    });
    addresses = addrResult.rows as unknown as DbAddress[];
  }

  return orders.map((order) => ({
    ...order,
    items:   items.filter((i) => i.orderId === order.id),
    address: addresses.find((a) => a.id === order.addressId) ?? null,
  }));
}

// ─── Order stats (for dashboard) ─────────────────────────
export async function getOrderStats() {
  const [total, pending, shipped, delivered, revenue] = await Promise.all([
    db.execute("SELECT COUNT(*) as c FROM orders"),
    db.execute("SELECT COUNT(*) as c FROM orders WHERE status = 'PENDING'"),
    db.execute("SELECT COUNT(*) as c FROM orders WHERE status = 'SHIPPED'"),
    db.execute("SELECT COUNT(*) as c FROM orders WHERE status = 'DELIVERED'"),
    db.execute("SELECT COALESCE(SUM(total), 0) as t FROM orders WHERE paymentStatus = 'PAID'"),
  ]);

  return {
    totalOrders:     Number(total.rows[0].c),
    pendingOrders:   Number(pending.rows[0].c),
    shippedOrders:   Number(shipped.rows[0].c),
    deliveredOrders: Number(delivered.rows[0].c),
    totalRevenue:    Number(revenue.rows[0].t),
  };
}
