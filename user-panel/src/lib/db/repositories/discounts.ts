import { db } from "@/lib/db/client";
import { now } from "@/lib/db/helpers";
import type { DbDiscount } from "@/lib/db/types";

export interface DiscountValidation {
  valid:    boolean;
  discount?: DbDiscount;
  amount?:   number; // discount amount in paisa
  error?:    string;
}

export async function validateDiscount(code: string, subtotal: number): Promise<DiscountValidation> {
  const result = await db.execute({
    sql:  "SELECT * FROM discounts WHERE code = ? COLLATE NOCASE LIMIT 1",
    args: [code],
  });

  if (result.rows.length === 0) {
    return { valid: false, error: "Invalid discount code" };
  }

  const discount = result.rows[0] as unknown as DbDiscount;
  const currentTime = now();

  if (discount.status !== "ACTIVE") {
    return { valid: false, error: "This discount is not active" };
  }
  if (currentTime > discount.expiresAt) {
    return { valid: false, error: "This discount has expired" };
  }
  if (discount.usedCount >= discount.maxUses) {
    return { valid: false, error: "This discount has reached its usage limit" };
  }
  if (subtotal < discount.minOrder) {
    const minRupees = discount.minOrder / 100;
    return { valid: false, error: `Minimum order of PKR ${minRupees.toLocaleString()} required` };
  }

  const amount = discount.type === "PERCENTAGE"
    ? Math.round((subtotal * discount.value) / 100)
    : discount.value;

  return { valid: true, discount, amount };
}