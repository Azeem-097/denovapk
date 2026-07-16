import { db } from "@/lib/db/client";
import { generateId, now } from "@/lib/db/helpers";
import type { DbLoyaltyTransaction, LoyaltyTransactionType } from "@/lib/db/types";

// ─── Add a loyalty transaction + update user balance ─────
export async function addLoyaltyTransaction(input: {
  userId:       string;
  orderId?:     string | null;
  type:         LoyaltyTransactionType;
  points:       number;      // + for earn, - for redeem
  description?: string;
}): Promise<{ id: string; newBalance: number }> {
  const t = now();

  // Get current user balance
  const userResult = await db.execute({
    sql:  "SELECT loyaltyPoints FROM users WHERE id = ? LIMIT 1",
    args: [input.userId],
  });

  if (userResult.rows.length === 0) {
    throw new Error(`User ${input.userId} not found`);
  }

  const currentBalance = Number(userResult.rows[0].loyaltyPoints);
  const newBalance = currentBalance + input.points;

  if (newBalance < 0) {
    throw new Error(`Insufficient points. Balance: ${currentBalance}, tried to deduct: ${Math.abs(input.points)}`);
  }

  // Insert transaction
  const txId = generateId();
  await db.execute({
    sql: `INSERT INTO loyalty_transactions (id, userId, orderId, type, points, balance, description, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      txId, input.userId, input.orderId ?? null,
      input.type, input.points, newBalance,
      input.description ?? null, t,
    ],
  });

  // Update user's balance
  await db.execute({
    sql:  "UPDATE users SET loyaltyPoints = ?, updatedAt = ? WHERE id = ?",
    args: [newBalance, t, input.userId],
  });

  return { id: txId, newBalance };
}

// ─── Get user's current balance ──────────────────────────
export async function getUserPoints(userId: string): Promise<number> {
  const result = await db.execute({
    sql:  "SELECT loyaltyPoints FROM users WHERE id = ? LIMIT 1",
    args: [userId],
  });
  if (result.rows.length === 0) return 0;
  return Number(result.rows[0].loyaltyPoints);
}

// ─── Get user's transaction history ──────────────────────
export async function getUserLoyaltyHistory(userId: string, limit = 50): Promise<DbLoyaltyTransaction[]> {
  const result = await db.execute({
    sql:  "SELECT * FROM loyalty_transactions WHERE userId = ? ORDER BY createdAt DESC LIMIT ?",
    args: [userId, limit],
  });
  return result.rows as unknown as DbLoyaltyTransaction[];
}

// ─── Award points based on order value ───────────────────
export async function awardPointsForOrder(
  userId:      string,
  orderId:     string,
  orderTotal:  number,       // in paisa (final paid amount, excluding shipping)
  earningRate: number        // e.g. 5 (means 5%)
): Promise<number> {
  // Convert paisa to rupees, apply rate, floor to integer
  const rupees = orderTotal / 100;
  const points = Math.floor((rupees * earningRate) / 100);

  if (points <= 0) return 0;

  await addLoyaltyTransaction({
    userId,
    orderId,
    type:        "EARNED",
    points,
    description: `Earned from order`,
  });

  return points;
}

// ─── Redeem points at checkout ───────────────────────────
export async function redeemPoints(
  userId:     string,
  orderId:    string,
  points:     number,
  pointValue: number      // e.g. 1 (means 1 point = Rs 1)
): Promise<{ pointsUsed: number; discountPaisa: number }> {
  if (points <= 0) return { pointsUsed: 0, discountPaisa: 0 };

  const discountRupees = points * pointValue;
  const discountPaisa  = Math.round(discountRupees * 100);

  await addLoyaltyTransaction({
    userId,
    orderId,
    type:        "REDEEMED",
    points:      -points,
    description: `Redeemed for order`,
  });

  return { pointsUsed: points, discountPaisa };
}

// ─── Admin: Get all customers with points ────────────────
export interface CustomerWithPoints {
  id:           string;
  name:         string;
  email:        string;
  phone:        string | null;
  loyaltyPoints: number;
  totalEarned:  number;
  totalRedeemed: number;
  lastActivity: number | null;
}

export async function getCustomersWithPoints(limit = 100): Promise<CustomerWithPoints[]> {
  const result = await db.execute({
    sql: `
      SELECT u.id, u.name, u.email, u.phone, u.loyaltyPoints,
        COALESCE((SELECT SUM(points) FROM loyalty_transactions WHERE userId = u.id AND type = 'EARNED'), 0) as totalEarned,
        COALESCE(ABS((SELECT SUM(points) FROM loyalty_transactions WHERE userId = u.id AND type = 'REDEEMED')), 0) as totalRedeemed,
        (SELECT MAX(createdAt) FROM loyalty_transactions WHERE userId = u.id) as lastActivity
      FROM users u
      WHERE u.isActive = 1
      ORDER BY u.loyaltyPoints DESC
      LIMIT ?
    `,
    args: [limit],
  });

  return result.rows.map((r) => ({
    id:            r.id as string,
    name:          r.name as string,
    email:         r.email as string,
    phone:         r.phone as string | null,
    loyaltyPoints: Number(r.loyaltyPoints),
    totalEarned:   Number(r.totalEarned),
    totalRedeemed: Number(r.totalRedeemed),
    lastActivity:  r.lastActivity ? Number(r.lastActivity) : null,
  }));
}

// ─── Admin: Adjust customer points manually ──────────────
export async function adjustCustomerPoints(
  userId:      string,
  adjustment:  number,    // + or -
  reason:      string
): Promise<{ newBalance: number }> {
  const result = await addLoyaltyTransaction({
    userId,
    type:        "ADJUSTED",
    points:      adjustment,
    description: `Admin adjustment: ${reason}`,
  });

  return { newBalance: result.newBalance };
}

// ─── Program stats for dashboard ─────────────────────────
export async function getLoyaltyStats() {
  const [totalUsers, totalPoints, totalEarned, totalRedeemed] = await Promise.all([
    db.execute("SELECT COUNT(*) as c FROM users WHERE loyaltyPoints > 0"),
    db.execute("SELECT COALESCE(SUM(loyaltyPoints), 0) as v FROM users"),
    db.execute("SELECT COALESCE(SUM(points), 0) as v FROM loyalty_transactions WHERE type = 'EARNED'"),
    db.execute("SELECT COALESCE(ABS(SUM(points)), 0) as v FROM loyalty_transactions WHERE type = 'REDEEMED'"),
  ]);

  return {
    membersWithPoints:  Number(totalUsers.rows[0].c),
    totalOutstanding:   Number(totalPoints.rows[0].v),
    totalEverEarned:    Number(totalEarned.rows[0].v),
    totalEverRedeemed:  Number(totalRedeemed.rows[0].v),
  };
}