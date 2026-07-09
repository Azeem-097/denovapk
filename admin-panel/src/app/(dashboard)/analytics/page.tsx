"use client";
import { BarChart3, TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { dashboardStats, revenueData, topProducts } from "@/lib/data";
import { formatPrice, cn } from "@/lib/utils";
import Image from "next/image";

export default function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Analytics</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">Detailed performance and sales insights.</p>
      </div>

      {/* Time period */}
      <div className="bg-white border border-[#e5e7eb] p-3 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-[#6b7280] mr-2">Period:</span>
        {["7 days", "30 days", "3 months", "6 months", "12 months", "All time"].map((p, i) => (
          <button
            key={p}
            className={cn(
              "px-3 py-1.5 text-xs font-medium border transition-colors",
              i === 2
                ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                : "text-[#6b7280] border-[#e5e7eb] hover:text-[#1a1a1a] hover:border-[#1a1a1a]"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Revenue"           value={formatPrice(dashboardStats.totalRevenue)}    change={12.5}  icon={DollarSign} />
        <StatsCard title="Orders"            value={dashboardStats.totalOrders.toLocaleString()} change={8.3}   icon={ShoppingCart} />
        <StatsCard title="New Customers"     value="245"                                          change={22.1}  icon={Users} />
        <StatsCard title="Conversion Rate"   value={`${dashboardStats.conversionRate}%`}          change={-2.4}  icon={TrendingUp} />
      </div>

      {/* Revenue chart - large */}
      <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold tracking-[0.1em] uppercase text-[#1a1a1a]">
            Revenue Over Time
          </h2>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#c9a96e]" />
              <span className="text-[#6b7280]">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#1a1a1a]" />
              <span className="text-[#6b7280]">Orders</span>
            </div>
          </div>
        </div>

        <div className="flex items-end gap-2 h-64">
          {revenueData.map((d) => {
            const maxRev    = Math.max(...revenueData.map((r) => r.revenue));
            const maxOrders = Math.max(...revenueData.map((r) => r.orders));
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-0.5 h-56">
                  <div
                    className="flex-1 bg-[#c9a96e] hover:bg-[#b8955a] transition-colors rounded-t"
                    style={{ height: `${(d.revenue / maxRev) * 100}%` }}
                    title={`Revenue: ${formatPrice(d.revenue)}`}
                  />
                  <div
                    className="flex-1 bg-[#1a1a1a] hover:bg-[#333] transition-colors rounded-t"
                    style={{ height: `${(d.orders / maxOrders) * 100}%` }}
                    title={`Orders: ${d.orders}`}
                  />
                </div>
                <p className="text-[10px] text-[#6b7280] font-medium">{d.date}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top Products */}
        <div className="bg-white border border-[#e5e7eb] p-5">
          <h2 className="text-sm font-semibold tracking-[0.1em] uppercase text-[#1a1a1a] mb-5">
            Top Products by Revenue
          </h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#c9a96e] w-6">{i + 1}</span>
                <div className="relative w-10 h-10 bg-[#fafaf9] flex-shrink-0">
                  <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1a1a1a] truncate">{p.name}</p>
                  <p className="text-[10px] text-[#6b7280]">{p.sold} units sold</p>
                </div>
                <p className="text-xs font-bold text-[#1a1a1a]">{formatPrice(p.revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources (mock) */}
        <div className="bg-white border border-[#e5e7eb] p-5">
          <h2 className="text-sm font-semibold tracking-[0.1em] uppercase text-[#1a1a1a] mb-5">
            Traffic Sources
          </h2>
          <div className="space-y-3">
            {[
              { source: "Instagram",       visits: 4521, pct: 42, trend: "up"   },
              { source: "Direct",          visits: 2891, pct: 27, trend: "up"   },
              { source: "Google Search",   visits: 1893, pct: 18, trend: "up"   },
              { source: "Facebook",        visits: 843,  pct: 8,  trend: "down" },
              { source: "TikTok",          visits: 542,  pct: 5,  trend: "up"   },
            ].map((t) => (
              <div key={t.source}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#1a1a1a]">{t.source}</span>
                    {t.trend === "up"
                      ? <TrendingUp size={11} className="text-green-500" />
                      : <TrendingDown size={11} className="text-red-500" />}
                  </div>
                  <span className="text-xs text-[#6b7280]">{t.visits.toLocaleString()} visits ({t.pct}%)</span>
                </div>
                <div className="h-1.5 bg-[#e5e7eb] overflow-hidden">
                  <div className="h-full bg-[#c9a96e]" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#f5f0e8] border border-[#c9a96e]/30 p-5 text-center">
        <BarChart3 size={24} className="text-[#c9a96e] mx-auto mb-2" />
        <p className="text-sm font-semibold text-[#1a1a1a]">More Analytics Coming Soon</p>
        <p className="text-xs text-[#6b7280] mt-1">Conversion funnels, customer LTV, cohort analysis, and more.</p>
      </div>
    </div>
  );
}