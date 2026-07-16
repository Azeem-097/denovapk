import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/db/repositories/users";
import { isBirthdayWithinValidityPeriod } from "@/lib/db/repositories/birthday";
import { getUserPoints } from "@/lib/db/repositories/loyalty";
import { getBoolSetting, getNumberSetting, getStringSetting } from "@/lib/db/repositories/settings";
import { db } from "@/lib/db/client";

/**
 * Determines which promotion applies to the current user.
 *
 * PRIORITY (only ONE can apply):
 *   1. Birthday Discount (highest)
 *   2. First Order Discount
 *   3. Loyalty Points (lowest)
 *
 * Returns the active promotion + reason why others are blocked.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subtotal = Number(searchParams.get("subtotal") ?? 0);

  const user = await getCurrentUser();

  // Guest users get no promotions
  if (!user) {
    return NextResponse.json({
      activePromo:   null,
      birthday:      { eligible: false, blocked: false },
      firstOrder:    { eligible: false, blocked: false },
      loyalty:       { eligible: false, blocked: false, points: 0 },
      message:       null,
    });
  }

  const fullUser = await getUserById(user.id);
  if (!fullUser) {
    return NextResponse.json({
      activePromo: null,
      birthday:    { eligible: false, blocked: false },
      firstOrder:  { eligible: false, blocked: false },
      loyalty:     { eligible: false, blocked: false, points: 0 },
      message:     null,
    });
  }

  // ─── Check all 3 promotions ────────────────────────────

  // 1. BIRTHDAY
  let birthdayEligible = false;
  let birthdayDiscount = 0;
  let birthdayDiscountText = "";

  const bdayEnabled = await getBoolSetting("birthday_enabled", true);
  if (bdayEnabled && fullUser.birthday) {
    const [validityDays, discountPct, fixedAmount, minOrderRupees] = await Promise.all([
      getNumberSetting("birthday_validity_days", 7),
      getNumberSetting("birthday_discount_pct", 15),
      getNumberSetting("birthday_fixed_amount", 0),
      getNumberSetting("birthday_min_order", 3000),
    ]);

    const isInWindow = isBirthdayWithinValidityPeriod(fullUser.birthday, validityDays);
    if (isInWindow && subtotal >= minOrderRupees) {
      birthdayEligible = true;
      if (fixedAmount > 0) {
        birthdayDiscount = fixedAmount;
        birthdayDiscountText = `Rs. ${fixedAmount}`;
      } else {
        birthdayDiscount = Math.round((subtotal * discountPct) / 100);
        birthdayDiscountText = `${discountPct}%`;
      }
    } else if (isInWindow && subtotal < minOrderRupees) {
      // Birthday eligible but min order not met
      birthdayEligible = false; // Can't apply yet
    }
  }

  // 2. FIRST ORDER
  let firstOrderEligible = false;
  let firstOrderDiscount = 0;
  let firstOrderDiscountText = "";

  const foEnabled = await getBoolSetting("first_order_enabled", true);
  if (foEnabled) {
    // Check if user has ANY completed orders
    const orderCount = await db.execute({
      sql:  "SELECT COUNT(*) as c FROM orders WHERE userId = ?",
      args: [user.id],
    });
    const hasOrders = Number(orderCount.rows[0].c) > 0;

    if (!hasOrders) {
      const [foPct, foFixed, foMinOrder] = await Promise.all([
        getNumberSetting("first_order_discount_pct", 10),
        getNumberSetting("first_order_fixed_amount", 0),
        getNumberSetting("first_order_min_order", 2000),
      ]);

      if (subtotal >= foMinOrder) {
        firstOrderEligible = true;
        if (foFixed > 0) {
          firstOrderDiscount = foFixed;
          firstOrderDiscountText = `Rs. ${foFixed}`;
        } else {
          firstOrderDiscount = Math.round((subtotal * foPct) / 100);
          firstOrderDiscountText = `${foPct}%`;
        }
      }
    }
  }

  // 3. LOYALTY
  const loyaltyEnabled = await getBoolSetting("loyalty_enabled", true);
  const loyaltyPoints  = loyaltyEnabled ? await getUserPoints(user.id) : 0;
  const minRedemption  = await getNumberSetting("loyalty_min_redemption", 100);
  const loyaltyCanRedeem = loyaltyPoints >= minRedemption;

  // ─── PRIORITY LOGIC ────────────────────────────────────
  // Only ONE promotion can be active at a time

  let activePromo: "birthday" | "first_order" | "loyalty" | null = null;
  let message: string | null = null;

  if (birthdayEligible) {
    // BIRTHDAY wins — blocks everything else
    activePromo = "birthday";
    message = `Happy Birthday! Your ${birthdayDiscountText} birthday discount is applied to this order. Loyalty rewards cannot be used or earned on birthday orders.`;
  } else if (firstOrderEligible) {
    // FIRST ORDER — blocks loyalty
    activePromo = "first_order";
    const foMsg = await getStringSetting("first_order_message", "Welcome! Enjoy {{discount}} off your first order.");
    message = foMsg.replace(/\{\{discount\}\}/g, firstOrderDiscountText) +
      " Loyalty rewards are not available on your first order.";
  } else if (loyaltyEnabled && loyaltyCanRedeem) {
    // LOYALTY — only if no higher promo
    activePromo = "loyalty";
    message = null;
  }

  return NextResponse.json({
    activePromo,
    birthday: {
      eligible:     birthdayEligible,
      blocked:      false,
      discount:     birthdayDiscount,
      discountText: birthdayDiscountText,
    },
    firstOrder: {
      eligible:     firstOrderEligible,
      blocked:      birthdayEligible,
      discount:     firstOrderDiscount,
      discountText: firstOrderDiscountText,
    },
    loyalty: {
      eligible:     loyaltyEnabled && loyaltyCanRedeem && !birthdayEligible && !firstOrderEligible,
      blocked:      birthdayEligible || firstOrderEligible,
      blockedBy:    birthdayEligible ? "birthday" : firstOrderEligible ? "first_order" : null,
      points:       loyaltyPoints,
      canEarn:      !birthdayEligible && !firstOrderEligible,
    },
    message,
  });
}