import { db } from "@/lib/db/client";

/**
 * All analytics queries live here.
 * Every function accepts a date range (startTs, endTs) as Unix timestamps.
 *
 * Convention:
 *   - Revenue values are in PAISA (integer). Divide by 100 for rupees.
 *   - Timestamps are Unix seconds.
 *   - Compare period is same length, immediately before start.
 */

// ─── Date range helper ───────────────────────────────────
export interface DateRange {
  startTs: number;  // Unix seconds, inclusive
  endTs:   number;  // Unix seconds, exclusive
}

/**
 * Build a date range for a preset (days from now to now).
 * days = 0 means "all time" (year 2000 to now).
 */
export function buildRange(days: number): DateRange {
  const now = Math.floor(Date.now() / 1000);
  if (days <= 0) {
    // "All time" — start way in the past
    return { startTs: 946684800 /* Jan 1 2000 */, endTs: now };
  }
  return { startTs: now - days * 86400, endTs: now };
}

/**
 * Build the same-length previous period, immediately before the given range.
 * Used for % change comparisons.
 */
export function buildPreviousRange(range: DateRange): DateRange {
  const length = range.endTs - range.startTs;
  return {
    startTs: range.startTs - length,
    endTs:   range.startTs,
  };
}

// ═══════════════════════════════════════════════════════
//  KPI stats — with previous-period comparison
// ═══════════════════════════════════════════════════════
export interface AnalyticsKPIs {
  revenue:          number;         // paisa
  orders:           number;
  newCustomers:     number;
  avgOrderValue:    number;         // paisa
  revenueChange:    number;         // %
  ordersChange:     number;
  customersChange:  number;
  aovChange:        number;
}

export async function getAnalyticsKPIs(range: DateRange): Promise<AnalyticsKPIs> {
  const prev = buildPreviousRange(range);

  const [
    revCur, ordCur, cusCur,
    revPrev, ordPrev, cusPrev,
  ] = await Promise.all([
    db.execute({
      sql:  "SELECT COALESCE(SUM(total), 0) as v, COUNT(*) as c FROM orders WHERE createdAt >= ? AND createdAt < ? AND paymentStatus = 'PAID'",
      args: [range.startTs, range.endTs],
    }),
    db.execute({
      sql:  "SELECT COUNT(*) as c FROM orders WHERE createdAt >= ? AND createdAt < ?",
      args: [range.startTs, range.endTs],
    }),
    db.execute({
      sql:  "SELECT COUNT(*) as c FROM users WHERE createdAt >= ? AND createdAt < ?",
      args: [range.startTs, range.endTs],
    }),
    db.execute({
      sql:  "SELECT COALESCE(SUM(total), 0) as v, COUNT(*) as c FROM orders WHERE createdAt >= ? AND createdAt < ? AND paymentStatus = 'PAID'",
      args: [prev.startTs, prev.endTs],
    }),
    db.execute({
      sql:  "SELECT COUNT(*) as c FROM orders WHERE createdAt >= ? AND createdAt < ?",
      args: [prev.startTs, prev.endTs],
    }),
    db.execute({
      sql:  "SELECT COUNT(*) as c FROM users WHERE createdAt >= ? AND createdAt < ?",
      args: [prev.startTs, prev.endTs],
    }),
  ]);

  const revenue    = Number(revCur.rows[0].v);
  const orders     = Number(ordCur.rows[0].c);
  const paidOrders = Number(revCur.rows[0].c);  // count of PAID orders (for AOV)
  const newCust    = Number(cusCur.rows[0].c);

  const prevRev  = Number(revPrev.rows[0].v);
  const prevOrd  = Number(ordPrev.rows[0].c);
  const prevPaid = Number(revPrev.rows[0].c);
  const prevCus  = Number(cusPrev.rows[0].c);

  const aov     = paidOrders > 0 ? Math.round(revenue / paidOrders) : 0;
  const prevAov = prevPaid   > 0 ? Math.round(prevRev / prevPaid) : 0;

  return {
    revenue,
    orders,
    newCustomers:    newCust,
    avgOrderValue:   aov,
    revenueChange:   pctChange(revenue, prevRev),
    ordersChange:    pctChange(orders,  prevOrd),
    customersChange: pctChange(newCust, prevCus),
    aovChange:       pctChange(aov,     prevAov),
  };
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number(((current - previous) / previous * 100).toFixed(1));
}

// ═══════════════════════════════════════════════════════
//  Revenue trend — bucketed by day / week / month
//  depending on range length
// ═══════════════════════════════════════════════════════
export interface RevenuePoint {
  date:    string;    // Display label
  ts:      number;    // Start of bucket, for sorting
  revenue: number;    // Paisa
  orders:  number;
}

export async function getRevenueTrend(range: DateRange): Promise<RevenuePoint[]> {
  const lengthDays = Math.max(1, Math.round((range.endTs - range.startTs) / 86400));

  // Choose bucket size based on range length
  let bucketSec: number;
  let format:    "day" | "week" | "month";

  if (lengthDays <= 7)        { bucketSec = 86400;      format = "day";   }
  else if (lengthDays <= 31)  { bucketSec = 86400;      format = "day";   }
  else if (lengthDays <= 90)  { bucketSec = 7 * 86400;  format = "week";  }
  else                         { bucketSec = 30 * 86400; format = "month"; }

  const buckets: RevenuePoint[] = [];

  // Align to bucket boundary — start from most recent, going back
  let cursorEnd = range.endTs;
  while (cursorEnd > range.startTs) {
    const cursorStart = Math.max(range.startTs, cursorEnd - bucketSec);

    const result = await db.execute({
      sql:  "SELECT COALESCE(SUM(total), 0) as r, COUNT(*) as c FROM orders WHERE createdAt >= ? AND createdAt < ? AND paymentStatus = 'PAID'",
      args: [cursorStart, cursorEnd],
    });

    const d = new Date(cursorStart * 1000);
    let label = "";
    if (format === "day")   label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (format === "week")  label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (format === "month") label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    buckets.push({
      date:    label,
      ts:      cursorStart,
      revenue: Number(result.rows[0].r),
      orders:  Number(result.rows[0].c),
    });

    cursorEnd = cursorStart;
  }

  return buckets.sort((a, b) => a.ts - b.ts);
}

// ═══════════════════════════════════════════════════════
//  Orders by status
// ═══════════════════════════════════════════════════════
export interface OrdersByStatus {
  status: string;
  count:  number;
}

export async function getOrdersByStatus(range: DateRange): Promise<OrdersByStatus[]> {
  const result = await db.execute({
    sql:  `SELECT status, COUNT(*) as c FROM orders
           WHERE createdAt >= ? AND createdAt < ?
           GROUP BY status ORDER BY c DESC`,
    args: [range.startTs, range.endTs],
  });

  return result.rows.map((r) => ({
    status: String(r.status).toLowerCase(),
    count:  Number(r.c),
  }));
}

// ═══════════════════════════════════════════════════════
//  Payment method breakdown
// ═══════════════════════════════════════════════════════
export interface PaymentBreakdown {
  method:  string;
  orders:  number;
  revenue: number;      // paisa
}

export async function getPaymentBreakdown(range: DateRange): Promise<PaymentBreakdown[]> {
  const result = await db.execute({
    sql:  `SELECT paymentMethod, COUNT(*) as c, COALESCE(SUM(total), 0) as r
           FROM orders WHERE createdAt >= ? AND createdAt < ?
           GROUP BY paymentMethod ORDER BY c DESC`,
    args: [range.startTs, range.endTs],
  });

  return result.rows.map((r) => ({
    method:  String(r.paymentMethod),
    orders:  Number(r.c),
    revenue: Number(r.r),
  }));
}

// ═══════════════════════════════════════════════════════
//  Sales by collection
// ═══════════════════════════════════════════════════════
export interface CollectionSales {
  collectionId:   string;
  collectionName: string;
  units:          number;
  revenue:        number;   // paisa
}

export async function getSalesByCollection(range: DateRange): Promise<CollectionSales[]> {
  const result = await db.execute({
    sql: `
      SELECT
        COALESCE(c.id, 'uncategorized')       as collectionId,
        COALESCE(c.name, 'Uncategorized')     as collectionName,
        COALESCE(SUM(oi.quantity), 0)         as units,
        COALESCE(SUM(oi.subtotal), 0)         as revenue
      FROM order_items oi
      INNER JOIN orders o    ON o.id = oi.orderId
      INNER JOIN products p  ON p.id = oi.productId
      LEFT  JOIN collections c ON c.id = p.collectionId
      WHERE o.createdAt >= ? AND o.createdAt < ?
        AND o.paymentStatus = 'PAID'
        AND o.status NOT IN ('CANCELLED', 'REFUNDED')
      GROUP BY collectionId, collectionName
      ORDER BY revenue DESC
      LIMIT 10
    `,
    args: [range.startTs, range.endTs],
  });

  return result.rows.map((r) => ({
    collectionId:   String(r.collectionId),
    collectionName: String(r.collectionName),
    units:          Number(r.units),
    revenue:        Number(r.revenue),
  }));
}

// ═══════════════════════════════════════════════════════
//  Top products (within date range, by revenue)
// ═══════════════════════════════════════════════════════
export interface TopProductStat {
  productId: string;
  name:      string;
  image:     string;
  units:     number;
  revenue:   number;    // paisa
}

export async function getTopProductsInRange(range: DateRange, limit = 10): Promise<TopProductStat[]> {
  const result = await db.execute({
    sql: `
      SELECT
        oi.productId as productId,
        oi.name      as name,
        (SELECT url FROM product_images WHERE productId = oi.productId AND isPrimary = 1 LIMIT 1) as image,
        SUM(oi.quantity) as units,
        SUM(oi.subtotal) as revenue
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.orderId
      WHERE o.createdAt >= ? AND o.createdAt < ?
        AND o.paymentStatus = 'PAID'
        AND o.status NOT IN ('CANCELLED', 'REFUNDED')
      GROUP BY oi.productId, oi.name
      ORDER BY revenue DESC
      LIMIT ?
    `,
    args: [range.startTs, range.endTs, limit],
  });

  return result.rows.map((r) => ({
    productId: String(r.productId),
    name:      String(r.name),
    image:     (r.image as string) ?? "",
    units:     Number(r.units),
    revenue:   Number(r.revenue),
  }));
}

// ═══════════════════════════════════════════════════════
//  Top customers (within date range, by spend)
// ═══════════════════════════════════════════════════════
export interface TopCustomerStat {
  userId:      string;
  name:        string;
  email:       string;
  orderCount:  number;
  totalSpent:  number;   // paisa
}

export async function getTopCustomersInRange(range: DateRange, limit = 10): Promise<TopCustomerStat[]> {
  const result = await db.execute({
    sql: `
      SELECT
        u.id           as userId,
        u.name         as name,
        u.email        as email,
        COUNT(o.id)    as orderCount,
        COALESCE(SUM(o.total), 0) as totalSpent
      FROM orders o
      INNER JOIN users u ON u.id = o.userId
      WHERE o.createdAt >= ? AND o.createdAt < ?
        AND o.paymentStatus = 'PAID'
      GROUP BY u.id, u.name, u.email
      ORDER BY totalSpent DESC
      LIMIT ?
    `,
    args: [range.startTs, range.endTs, limit],
  });

  return result.rows.map((r) => ({
    userId:      String(r.userId),
    name:        String(r.name),
    email:       String(r.email),
    orderCount:  Number(r.orderCount),
    totalSpent:  Number(r.totalSpent),
  }));
}
