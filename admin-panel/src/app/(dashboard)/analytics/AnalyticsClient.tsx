"use client";
import Image from "next/image";
import Link from "next/link";
import {
  DollarSign, ShoppingCart, UserPlus, TrendingUp,
  Users as UsersIcon, PackageOpen,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueAreaChart } from "@/components/analytics/RevenueAreaChart";
import { StatusDonut } from "@/components/analytics/StatusDonut";
import { CollectionBarChart } from "@/components/analytics/CollectionBarChart";
import { DateRangeSelector } from "@/components/analytics/DateRangeSelector";
import { CsvExportButton } from "@/components/analytics/CsvExportButton";
import { formatPaisa } from "@/lib/priceUtils";
import { cn } from "@/lib/utils";
import type {
  AnalyticsKPIs, RevenuePoint, OrdersByStatus,
  PaymentBreakdown, CollectionSales,
  TopProductStat, TopCustomerStat,
} from "@/lib/db/repositories/analytics";

interface Props {
  rangeValue:       string;
  kpis:             AnalyticsKPIs;
  revenueTrend:     RevenuePoint[];
  ordersByStatus:   OrdersByStatus[];
  payments:         PaymentBreakdown[];
  collectionSales:  CollectionSales[];
  topProducts:      TopProductStat[];
  topCustomers:     TopCustomerStat[];
}

// Payment method display labels
const PAYMENT_LABELS: Record<string, string> = {
  COD:           "Cash on Delivery",
  CARD:          "Card",
  JAZZCASH:      "JazzCash",
  EASYPAISA:     "EasyPaisa",
  BANK_TRANSFER: "Bank Transfer",
};

export function AnalyticsClient({
  rangeValue, kpis, revenueTrend, ordersByStatus,
  payments, collectionSales, topProducts, topCustomers,
}: Props) {

  const totalPaymentOrders = payments.reduce((sum, p) => sum + p.orders, 0);

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Analytics</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">
          Detailed sales performance and insights.
        </p>
      </div>

      <DateRangeSelector current={rangeValue} />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Revenue"        value={formatPaisa(kpis.revenue)}       change={kpis.revenueChange}   icon={DollarSign} />
        <StatsCard title="Orders"         value={kpis.orders.toLocaleString()}    change={kpis.ordersChange}    icon={ShoppingCart} />
        <StatsCard title="New Customers"  value={kpis.newCustomers.toLocaleString()} change={kpis.customersChange} icon={UserPlus} />
        <StatsCard title="Avg Order"      value={formatPaisa(kpis.avgOrderValue)} change={kpis.aovChange}       icon={TrendingUp} />
      </div>

      {/* Revenue trend chart */}
      <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <h2 className="text-sm font-semibold tracking-[0.1em] uppercase text-[#1a1a1a]">
            Revenue Trend
          </h2>
          <CsvExportButton
            filename={`revenue-trend-${rangeValue}`}
            rows={revenueTrend.map((p) => ({
              date:    p.date,
              revenue: p.revenue / 100,
              orders:  p.orders,
            }))}
            columns={[
              { key: "date",    label: "Date" },
              { key: "revenue", label: "Revenue (PKR)" },
              { key: "orders",  label: "Orders" },
            ]}
          />
        </div>

        {revenueTrend.length === 0 || revenueTrend.every((p) => p.revenue === 0 && p.orders === 0) ? (
          <div className="h-[240px] flex items-center justify-center text-sm text-[#6b7280]">
            No data in this period.
          </div>
        ) : (
          <RevenueAreaChart data={revenueTrend} height={260} />
        )}
      </div>

      {/* Orders by status + Payment methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
          <h2 className="text-sm font-semibold tracking-[0.1em] uppercase text-[#1a1a1a] mb-5">
            Orders by Status
          </h2>
          <StatusDonut data={ordersByStatus} />
        </div>

        <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
          <h2 className="text-sm font-semibold tracking-[0.1em] uppercase text-[#1a1a1a] mb-5">
            Payment Methods
          </h2>
          {payments.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-sm text-[#6b7280]">
              No orders in this period.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => {
                const pct = totalPaymentOrders > 0
                  ? (p.orders / totalPaymentOrders) * 100
                  : 0;
                return (
                  <div key={p.method}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-[#1a1a1a]">
                        {PAYMENT_LABELS[p.method] ?? p.method}
                      </span>
                      <span className="text-xs text-[#6b7280]">
                        {p.orders} orders · {formatPaisa(p.revenue)}
                      </span>
                    </div>
                    <div className="h-2 bg-[#f5f0e8] overflow-hidden">
                      <div className="h-full bg-[#c9a96e]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sales by collection */}
      <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold tracking-[0.1em] uppercase text-[#1a1a1a]">
            Sales by Collection
          </h2>
          <CsvExportButton
            filename={`sales-by-collection-${rangeValue}`}
            rows={collectionSales.map((c) => ({
              collection: c.collectionName,
              units:      c.units,
              revenue:    c.revenue / 100,
            }))}
            columns={[
              { key: "collection", label: "Collection" },
              { key: "units",      label: "Units Sold" },
              { key: "revenue",    label: "Revenue (PKR)" },
            ]}
          />
        </div>
        <CollectionBarChart data={collectionSales} />
      </div>

      {/* Top products + Top customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold tracking-[0.1em] uppercase text-[#1a1a1a]">
              Top Products
            </h2>
            <CsvExportButton
              filename={`top-products-${rangeValue}`}
              rows={topProducts.map((p) => ({
                name:    p.name,
                units:   p.units,
                revenue: p.revenue / 100,
              }))}
              columns={[
                { key: "name",    label: "Product" },
                { key: "units",   label: "Units" },
                { key: "revenue", label: "Revenue (PKR)" },
              ]}
            />
          </div>

          {topProducts.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6b7280]">
              <PackageOpen size={28} className="text-[#c9a96e] mx-auto mb-2" />
              No product sales in this period.
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#c9a96e] w-6 flex-shrink-0">{i + 1}</span>
                  {p.image ? (
                    <div className="relative w-10 h-10 bg-[#fafaf9] flex-shrink-0 overflow-hidden">
                      <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-[#fafaf9] flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${p.productId}`}
                      className="text-xs font-semibold text-[#1a1a1a] hover:text-[#c9a96e] transition-colors truncate block">
                      {p.name}
                    </Link>
                    <p className="text-[10px] text-[#6b7280]">{p.units} units sold</p>
                  </div>
                  <p className="text-xs font-bold text-[#1a1a1a] flex-shrink-0">{formatPaisa(p.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
          <h2 className="text-sm font-semibold tracking-[0.1em] uppercase text-[#1a1a1a] mb-5">
            Top Customers
          </h2>

          {topCustomers.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6b7280]">
              <UsersIcon size={28} className="text-[#c9a96e] mx-auto mb-2" />
              No registered customer orders in this period.
            </div>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((c, i) => (
                <div key={c.userId} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#c9a96e] w-6 flex-shrink-0">{i + 1}</span>
                  <div className="w-10 h-10 rounded-full bg-[#f5f0e8] flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-bold text-[#c9a96e]">{initials(c.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/customers/${c.userId}`}
                      className="text-xs font-semibold text-[#1a1a1a] hover:text-[#c9a96e] transition-colors truncate block">
                      {c.name}
                    </Link>
                    <p className="text-[10px] text-[#6b7280]">{c.orderCount} orders</p>
                  </div>
                  <p className="text-xs font-bold text-[#1a1a1a] flex-shrink-0">{formatPaisa(c.totalSpent)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={cn(
        "bg-[#f5f0e8] border border-[#c9a96e]/30 p-4 text-center text-xs text-[#6b7280]",
      )}>
        All figures reflect PAID orders only. Range: <span className="font-semibold text-[#1a1a1a]">{rangeLabel(rangeValue)}</span>
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function rangeLabel(v: string): string {
  if (v === "all") return "All time";
  return `Last ${v} days`;
}