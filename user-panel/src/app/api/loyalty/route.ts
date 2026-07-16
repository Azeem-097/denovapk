import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserPoints, getUserLoyaltyHistory } from "@/lib/db/repositories/loyalty";
import { getBoolSetting, getNumberSetting, getStringSetting } from "@/lib/db/repositories/settings";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [enabled, points, history, pointValue, minRedemption, maxRedemptionPct, programName, earningRate] = await Promise.all([
    getBoolSetting("loyalty_enabled", true),
    getUserPoints(user.id),
    getUserLoyaltyHistory(user.id, 20),
    getNumberSetting("loyalty_point_value", 1),
    getNumberSetting("loyalty_min_redemption", 100),
    getNumberSetting("loyalty_max_redemption_pct", 20),
    getStringSetting("loyalty_program_name", "Denova Rewards"),
    getNumberSetting("loyalty_earning_rate", 5),
  ]);

  return NextResponse.json({
    enabled,
    points,
    history,
    settings: {
      pointValue,
      minRedemption,
      maxRedemptionPct,
      programName,
      earningRate,
    },
  });
}