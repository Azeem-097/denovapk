import { getCustomersWithPoints, getLoyaltyStats } from "@/lib/db/repositories/loyalty";
import { getSettingsByCategory } from "@/lib/db/repositories/settings";
import { LoyaltyClient } from "./LoyaltyClient";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export default async function LoyaltyPage() {
  const [customers, stats, settings] = await Promise.all([
    getCustomersWithPoints(200),
    getLoyaltyStats(),
    getSettingsByCategory("loyalty"),
  ]);

  const enabled = settings.loyalty_enabled === "true";

  return (
    <LoyaltyClient
      initialCustomers={customers}
      stats={stats}
      settings={{
        enabled,
        earningRate:      Number(settings.loyalty_earning_rate ?? 5),
        pointValue:       Number(settings.loyalty_point_value ?? 1),
        minRedemption:    Number(settings.loyalty_min_redemption ?? 100),
        maxRedemptionPct: Number(settings.loyalty_max_redemption_pct ?? 20),
        programName:      settings.loyalty_program_name ?? "Denova Rewards",
      }}
    />
  );
}