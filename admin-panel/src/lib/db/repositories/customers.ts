import { db } from "@/lib/db/client";
import type { DbUser } from "@/lib/db/types";

export interface CustomerWithStats extends DbUser {
  totalOrders: number;
  totalSpent:  number;
  lastOrder:   string | null;
  city:        string;
}

export interface GetCustomersOptions {
  search?: string;
  filter?: "all" | "active" | "inactive" | "vip";
  limit?:  number;
  offset?: number;
}

export async function getAllCustomers(opts: GetCustomersOptions = {}): Promise<CustomerWithStats[]> {
  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (opts.filter === "active")   conditions.push("u.isActive = 1");
  if (opts.filter === "inactive") conditions.push("u.isActive = 0");

  if (opts.search) {
    conditions.push("(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)");
    const term = `%${opts.search}%`;
    args.push(term, term, term);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.execute({
    sql: `
      SELECT u.*,
        COALESCE((SELECT COUNT(*) FROM orders WHERE userId = u.id), 0) as totalOrders,
        COALESCE((SELECT SUM(total) FROM orders WHERE userId = u.id AND paymentStatus = 'PAID'), 0) as totalSpent,
        (SELECT MAX(createdAt) FROM orders WHERE userId = u.id) as lastOrderTs,
        COALESCE((SELECT city FROM addresses WHERE userId = u.id AND isDefault = 1 LIMIT 1),
                 (SELECT city FROM addresses WHERE userId = u.id LIMIT 1), '') as city
      FROM users u
      ${where}
      ORDER BY u.createdAt DESC
      ${opts.limit  ? `LIMIT ${opts.limit}`   : ""}
      ${opts.offset ? `OFFSET ${opts.offset}` : ""}
    `,
    args,
  });

  const rows = result.rows as unknown as Array<DbUser & {
    totalOrders: number;
    totalSpent:  number;
    lastOrderTs: number | null;
    city:        string;
  }>;

  let customers = rows.map((row) => ({
    ...row,
    totalOrders: Number(row.totalOrders),
    totalSpent:  Number(row.totalSpent),
    lastOrder:   row.lastOrderTs ? new Date(row.lastOrderTs * 1000).toISOString() : null,
    city:        row.city,
  }));

  // VIP filter (client-side because totalSpent is calculated)
  if (opts.filter === "vip") {
    customers = customers.filter((c) => c.totalSpent > 10000000); // > PKR 100,000 in paisa
  }

  return customers;
}

export async function getCustomerById(id: string): Promise<CustomerWithStats | null> {
  const customers = await getAllCustomers({ limit: 1 });
  const result = await db.execute({
    sql: `
      SELECT u.*,
        COALESCE((SELECT COUNT(*) FROM orders WHERE userId = u.id), 0) as totalOrders,
        COALESCE((SELECT SUM(total) FROM orders WHERE userId = u.id AND paymentStatus = 'PAID'), 0) as totalSpent,
        (SELECT MAX(createdAt) FROM orders WHERE userId = u.id) as lastOrderTs,
        COALESCE((SELECT city FROM addresses WHERE userId = u.id AND isDefault = 1 LIMIT 1),
                 (SELECT city FROM addresses WHERE userId = u.id LIMIT 1), '') as city
      FROM users u
      WHERE u.id = ? LIMIT 1
    `,
    args: [id],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0] as unknown as DbUser & {
    totalOrders: number; totalSpent: number; lastOrderTs: number | null; city: string;
  };

  return {
    ...row,
    totalOrders: Number(row.totalOrders),
    totalSpent:  Number(row.totalSpent),
    lastOrder:   row.lastOrderTs ? new Date(row.lastOrderTs * 1000).toISOString() : null,
    city:        row.city,
  };
}

export async function getCustomerCount(): Promise<number> {
  const result = await db.execute("SELECT COUNT(*) as c FROM users");
  return Number(result.rows[0].c);
}