import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/db/repositories/users";
import { isBirthdayWithinValidityPeriod } from "@/lib/db/repositories/birthday";
import { getBoolSetting, getNumberSetting } from "@/lib/db/repositories/settings";

/**
 * Checks if the current user is eligible for birthday discount today.
 * Returns discount details if eligible.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ eligible: false });

  const enabled = await getBoolSetting("birthday_enabled", true);
  if (!enabled) return NextResponse.json({ eligible: false });

  const fullUser = await getUserById(user.id);
  if (!fullUser || !fullUser.birthday) return NextResponse.json({ eligible: false });

  const [validityDays, discountPct, fixedAmount, minOrder] = await Promise.all([
    getNumberSetting("birthday_validity_days", 7),
    getNumberSetting("birthday_discount_pct", 15),
    getNumberSetting("birthday_fixed_amount", 0),
    getNumberSetting("birthday_min_order", 3000),
  ]);

  const isEligible = isBirthdayWithinValidityPeriod(fullUser.birthday, validityDays);

  return NextResponse.json({
    eligible: isEligible,
    discountPct,
    fixedAmount,
    minOrder,
    validityDays,
  });
}