import { Suspense } from "react";
import {
  buildRange,
  getAnalyticsKPIs,
  getRevenueTrend,
  getOrdersByStatus,
  getPaymentBreakdown,
  getSalesByCollection,
  getTopProductsInRange,
  getTopCustomersInRange,
} from "@/lib/db/repositories/analytics";
import { AnalyticsClient } from "./AnalyticsClient";

export const dynamic    = "force-dynamic";
export const revalidate = 0;

interface Props {
  searchParams: Promise<{ range?: string }>;
}

/** Parse the ?range=X search param into a number of days. */
function parseRangeParam(raw?: string): { value: string; days: number } {
  if (raw === "all") return { value: "all", days: 0 };
  const n = Number(raw);
  if ([7, 30, 90].includes(n))  return { value: String(n), days: n };
  return { value: "30", days: 30 };  // default
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { value: rangeValue, days } = parseRangeParam(params.range);
  const range = buildRange(days);

  const [
    kpis, revenueTrend, ordersByStatus,
    payments, collectionSales, topProducts, topCustomers,
  ] = await Promise.all([
    getAnalyticsKPIs(range),
    getRevenueTrend(range),
    getOrdersByStatus(range),
    getPaymentBreakdown(range),
    getSalesByCollection(range),
    getTopProductsInRange(range, 10),
    getTopCustomersInRange(range, 10),
  ]);

  return (
    <Suspense>
      <AnalyticsClient
        rangeValue={rangeValue}
        kpis={kpis}
        revenueTrend={revenueTrend}
        ordersByStatus={ordersByStatus}
        payments={payments}
        collectionSales={collectionSales}
        topProducts={topProducts}
        topCustomers={topCustomers}
      />
    </Suspense>
  );
}