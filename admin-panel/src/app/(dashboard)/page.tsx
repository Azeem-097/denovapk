import Image from "next/image";
import Link from "next/link";
import {
  DollarSign, ShoppingCart, Users, Package,
  AlertTriangle, Clock, ArrowRight, TrendingUp, UserPlus,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueAreaChart } from "@/components/analytics/RevenueAreaChart";
import { getDashboardStats, getRevenueChartData, getTopProducts } from "@/lib/db/repositories/dashboard";
import { getAllOrders } from "@/lib/db/repositories/orders";
import { formatPaisa } from "@/lib/priceUtils";
import { formatDate, cn } from "@/lib/utils";
import { ORDER_STATUS_COLORS } from "@/lib/constants";

export const dynamic    = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  // Fetch everything in parallel
  const [stats, revenueData, topProducts, recentOrders] = await Promise.all([
    getDashboardStats(),
    getRevenueChartData(),
    getTopProducts(5),
    getAllOrders({ limit: 5 }),
  ]);

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Dashboard</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Welcome back! Here is what is happening with Denova PK today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6b7280] bg-white border border-[#e5e7eb] px-3 py-2">
          <Clock size={13} className="text-[#c9a96e]" />
          {new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Alert banners */}
      {(stats.pendingOrders > 0 || stats.lowStockItems > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {stats.pendingOrders > 0 && (
            <Link href="/orders" className="flex-1 flex items-center gap-3 bg-orange-50 border border-orange-200 px-4 py-3 hover:bg-orange-100 transition-colors">
              <AlertTriangle size={16} className="text-orange-500 flex-shrink-0" />
              <p className="text-sm text-orange-700 font-medium">
                {stats.pendingOrders} pending {stats.pendingOrders === 1 ? "order needs" : "orders need"} your attention
              </p>
              <ArrowRight size={14} className="text-orange-500 ml-auto flex-shrink-0" />
            </Link>
          )}
          {stats.lowStockItems > 0 && (
            <Link href="/inventory" className="flex-1 flex items-center gap-3 bg-red-50 border border-red-200 px-4 py-3 hover:bg-red-100 transition-colors">
              <Package size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">
                {stats.lowStockItems} product {stats.lowStockItems === 1 ? "variant is" : "variants are"} low in stock
              </p>
              <ArrowRight size={14} className="text-red-500 ml-auto flex-shrink-0" />
            </Link>
          )}
        </div>
      )}

      {/* Primary KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Revenue" value={formatPaisa(stats.totalRevenue)} change={stats.revenueChange}   icon={DollarSign} />
        <StatsCard title="Total Orders"  value={stats.totalOrders.toLocaleString()}    change={stats.ordersChange}    icon={ShoppingCart} />
        <StatsCard title="Customers"     value={stats.totalCustomers.toLocaleString()} change={stats.customersChange} icon={Users} />
        <StatsCard title="Products"      value={stats.totalProducts.toString()}                                        icon={Package} />
      </div>

      {/* Secondary stats — all real numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e7eb] p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={15} className="text-[#c9a96e]" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Avg Order Value</p>
          </div>
          <p className="text-2xl font-bold text-[#1a1a1a]">{formatPaisa(stats.avgOrderValue)}</p>
        </div>
        <div className="bg-white border border-[#e5e7eb] p-5">
          <div className="flex items-center gap-2 mb-1">
            <UserPlus size={15} className="text-[#c9a96e]" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">New Customers (30d)</p>
          </div>
          <p className="text-2xl font-bold text-[#1a1a1a]">{stats.newCustomers30d.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={15} className="text-orange-500" />
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">Pending Orders</p>
          </div>
          <p className="text-2xl font-bold text-orange-700">{stats.pendingOrders}</p>
        </div>
      </div>

      {/* Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold tracking-[0.1em] uppercase text-[#1a1a1a]">Revenue Overview</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#6b7280]">Last 12 months</span>
              <Link href="/analytics" className="text-xs text-[#c9a96e] hover:underline">
                Full analytics &rarr;
              </Link>
            </div>
          </div>
          <RevenueAreaChart data={revenueData} height={220} />
        </div>

        <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold tracking-[0.1em] uppercase text-[#1a1a1a]">Top Products</h2>
            <Link href="/products" className="text-xs text-[#c9a96e] hover:underline">View all</Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-center text-sm text-[#6b7280] py-8">No sales yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#6b7280] w-4 flex-shrink-0">{i + 1}</span>
                  {p.image ? (
                    <div className="relative w-10 h-10 flex-shrink-0 bg-[#fafaf9]">
                      <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 flex-shrink-0 bg-[#fafaf9]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1a1a1a] truncate">{p.name}</p>
                    <p className="text-[10px] text-[#6b7280]">{p.sold} sold</p>
                  </div>
                  <p className="text-xs font-bold text-[#1a1a1a] flex-shrink-0">{formatPaisa(p.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-[#e5e7eb]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
          <h2 className="text-sm font-semibold tracking-[0.1em] uppercase text-[#1a1a1a]">Recent Orders</h2>
          <Link href="/orders" className="text-xs text-[#c9a96e] hover:underline inline-flex items-center gap-1">
            View all <ArrowRight size={11} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingCart size={32} className="text-[#c9a96e] mx-auto mb-3" />
            <p className="text-sm text-[#6b7280]">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#fafaf9]">
                  {["Order", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-[#6b7280]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fafaf9] transition-colors">
                    <td className="px-4 py-3.5">
                      <Link href={`/orders/${order.id}`} className="text-[#c9a96e] font-semibold hover:underline text-xs">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-[#1a1a1a] text-xs">{order.guestName ?? "Registered User"}</p>
                      <p className="text-[11px] text-[#6b7280]">{order.guestEmail ?? "-"}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#6b7280]">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-bold text-[#1a1a1a]">{formatPaisa(order.total)}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide border",
                        ORDER_STATUS_COLORS[order.status.toLowerCase()]
                      )}>
                        {order.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#6b7280]">{formatDate(new Date(order.createdAt * 1000).toISOString())}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}