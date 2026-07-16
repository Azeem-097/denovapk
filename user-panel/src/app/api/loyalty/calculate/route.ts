import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserPoints } from "@/lib/db/repositories/loyalty";
import { getBoolSetting, getNumberSetting } from "@/lib/db/repositories/settings";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { pointsToUse, subtotal } = await req.json();

    const enabled = await getBoolSetting("loyalty_enabled", true);
    if (!enabled) return NextResponse.json({ error: "Loyalty program disabled" }, { status: 400 });

    const [pointValue, minRedeem, maxPct, balance] = await Promise.all([
      getNumberSetting("loyalty_point_value", 1),
      getNumberSetting("loyalty_min_redemption", 100),
      getNumberSetting("loyalty_max_redemption_pct", 20),
      getUserPoints(user.id),
    ]);

    const requested = Number(pointsToUse) || 0;

    if (requested < minRedeem) {
      return NextResponse.json({
        valid: false,
        error: `Minimum ${minRedeem} points required to redeem`,
      });
    }

    if (requested > balance) {
      return NextResponse.json({
        valid: false,
        error: `You only have ${balance} points`,
      });
    }

    const maxDiscountRupees = subtotal * (maxPct / 100);
    const maxPointsAllowed  = Math.floor(maxDiscountRupees / pointValue);
    const actualPoints      = Math.min(requested, maxPointsAllowed);
    const discountRupees    = actualPoints * pointValue;

    return NextResponse.json({
      valid:          true,
      pointsToUse:    actualPoints,
      discountAmount: discountRupees,
      balance,
      maxAllowed:     maxPointsAllowed,
      capped:         actualPoints < requested,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
  }
}