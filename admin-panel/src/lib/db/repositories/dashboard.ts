import { db } from "@/lib/db/client";

export interface DashboardStats {
  totalRevenue:      number;   // paisa
  totalOrders:       number;
  totalCustomers:    number;
  totalProducts:     number;
  pendingOrders:     number;
  lowStockItems:     number;
  avgOrderValue:     number;   // paisa
  newCustomers30d:   number;   // Real metric that replaces the mocked "conversionRate"
  revenueChange:     number;
  ordersChange:      number;
  customersChange:   number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now       = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - (60 * 60 * 24 * 30);
  const sixtyDaysAgo  = now - (60 * 60 * 24 * 60);

  const [
    revenue, orders, paidOrders, customers, products, pending, lowStock,
    revenue30, revenue60, orders30, orders60, customers30, customers60,
  ] = await Promise.all([
    db.execute("SELECT COALESCE(SUM(total), 0) as v FROM orders WHERE paymentStatus = 'PAID'"),
    db.execute("SELECT COUNT(*) as c FROM orders"),
    db.execute("SELECT COUNT(*) as c FROM orders WHERE paymentStatus = 'PAID'"),
    db.execute("SELECT COUNT(*) as c FROM users"),
    db.execute("SELECT COUNT(*) as c FROM products WHERE status = 'PUBLISHED'"),
    db.execute("SELECT COUNT(*) as c FROM orders WHERE status = 'PENDING'"),
    db.execute("SELECT COUNT(*) as c FROM product_variants WHERE stock < 10"),
    db.execute({ sql: "SELECT COALESCE(SUM(total), 0) as v FROM orders WHERE createdAt >= ? AND paymentStatus = 'PAID'", args: [thirtyDaysAgo] }),
    db.execute({ sql: "SELECT COALESCE(SUM(total), 0) as v FROM orders WHERE createdAt >= ? AND createdAt < ? AND paymentStatus = 'PAID'", args: [sixtyDaysAgo, thirtyDaysAgo] }),
    db.execute({ sql: "SELECT COUNT(*) as c FROM orders WHERE createdAt >= ?", args: [thirtyDaysAgo] }),
    db.execute({ sql: "SELECT COUNT(*) as c FROM orders WHERE createdAt >= ? AND createdAt < ?", args: [sixtyDaysAgo, thirtyDaysAgo] }),
    db.execute({ sql: "SELECT COUNT(*) as c FROM users WHERE createdAt >= ?", args: [thirtyDaysAgo] }),
    db.execute({ sql: "SELECT COUNT(*) as c FROM users WHERE createdAt >= ? AND createdAt < ?", args: [sixtyDaysAgo, thirtyDaysAgo] }),
  ]);

  const totalRevenue    = Number(revenue.rows[0].v);
  const totalOrders     = Number(orders.rows[0].c);
  const totalPaidOrders = Number(paidOrders.rows[0].c);
  const totalCustomers  = Number(customers.rows[0].c);

  const rev30 = Number(revenue30.rows[0].v);
  const rev60 = Number(revenue60.rows[0].v);
  const ord30 = Number(orders30.rows[0].c);
  const ord60 = Number(orders60.rows[0].c);
  const cus30 = Number(customers30.rows[0].c);
  const cus60 = Number(customers60.rows[0].c);

  return {
    totalRevenue,
    totalOrders,
    totalCustomers,
    totalProducts:   Number(products.rows[0].c),
    pendingOrders:   Number(pending.rows[0].c),
    lowStockItems:   Number(lowStock.rows[0].c),
    avgOrderValue:   totalPaidOrders > 0 ? Math.round(totalRevenue / totalPaidOrders) : 0,
    newCustomers30d: cus30,
    revenueChange:   percentChange(rev30, rev60),
    ordersChange:    percentChange(ord30, ord60),
    customersChange: percentChange(cus30, cus60),
  };
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number(((current - previous) / previous * 100).toFixed(1));
}

// ─── Revenue chart data (last 12 months) ─────────────────
export interface RevenueDataPoint {
  date:       string;
  yearMonth:  string;
  revenue:    number;
  refunds:    number;
  netRevenue: number;
  orders:     number;
}

export async function getRevenueChartData(): Promise<RevenueDataPoint[]> {
  const points: RevenueDataPoint[] = [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  for (let i = 11; i >= 0; i--) {
    const start = new Date(monthStart.getFullYear(), monthStart.getMonth() - i, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const startTs = Math.floor(start.getTime() / 1000);
    const endTs = Math.floor(end.getTime() / 1000);

    const result = await db.execute({
      sql:  `
        SELECT
          COALESCE(SUM(CASE WHEN paymentStatus = 'PAID' AND status != 'CANCELLED' THEN total ELSE 0 END), 0) as paidRevenue,
          COALESCE(SUM(CASE WHEN paymentStatus IN ('REFUNDED', 'PARTIALLY_REFUNDED') OR status = 'REFUNDED' THEN total ELSE 0 END), 0) as refunds,
          COUNT(CASE WHEN paymentStatus = 'PAID' AND status != 'CANCELLED' THEN 1 END) as c
        FROM orders
        WHERE createdAt >= ? AND createdAt < ?
      `,
      args: [startTs, endTs],
    });

    const paidRevenue = Number(result.rows[0].paidRevenue);
    const refunds = Number(result.rows[0].refunds);

    points.push({
      date:       start.toLocaleDateString("en-US", { month: "short" }),
      yearMonth:  `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
      revenue:    paidRevenue,
      refunds,
      netRevenue: paidRevenue - refunds,
      orders:     Number(result.rows[0].c),
    });
  }

  return points;
}

// ─── Top products ────────────────────────────────────────
export interface TopProduct {
  id:      string;
  name:    string;
  image:   string;
  sold:    number;
  revenue: number;
  stock:   number;
}

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const result = await db.execute({
    sql: `
      SELECT p.id, p.name,
        COALESCE(SUM(oi.quantity), 0) as sold,
        COALESCE(SUM(oi.subtotal), 0) as revenue,
        (SELECT COALESCE(SUM(stock), 0) FROM product_variants WHERE productId = p.id) as stock,
        (SELECT url FROM product_images WHERE productId = p.id AND isPrimary = 1 LIMIT 1) as image
      FROM products p
      INNER JOIN order_items oi ON oi.productId = p.id
      INNER JOIN orders o ON o.id = oi.orderId
      WHERE p.status = 'PUBLISHED'
        AND o.paymentStatus = 'PAID'
        AND o.status NOT IN ('CANCELLED', 'REFUNDED')
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT ?
    `,
    args: [limit],
  });

  return result.rows.map((r) => ({
    id:      r.id as string,
    name:    r.name as string,
    image:   (r.image as string) ?? "",
    sold:    Number(r.sold),
    revenue: Number(r.revenue),
    stock:   Number(r.stock),
  }));
}
