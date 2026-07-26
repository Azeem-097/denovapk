"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Download, Search, ChevronRight, ShoppingCart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from "@/lib/constants";
import { openWhatsApp, buildOrderConfirmationMessage } from "@/lib/whatsapp";
import type { AdminOrder, OrderStatus } from "@/types";

const STATUS_TABS: (OrderStatus | "all")[] = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export function OrdersPageClient({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");

  const filtered = useMemo(() => {
    return initialOrders.filter((o) => {
      const matchStatus = status === "all" || o.status === status;
      const matchSearch = search.trim() === "" ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [search, status, initialOrders]);

  const stats = useMemo(() => ({
    total:   initialOrders.reduce((sum, o) => sum + o.total, 0),
    pending: initialOrders.filter((o) => o.status === "pending").length,
    shipped: initialOrders.filter((o) => o.status === "shipped").length,
    count:   initialOrders.length,
  }), [initialOrders]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialOrders.length };
    initialOrders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, [initialOrders]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Orders</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Manage and track all customer orders.</p>
        </div>
        <Button variant="outline"><Download size={14} />Export Orders</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickStat label="Total Orders"  value={stats.count.toString()}   />
        <QuickStat label="Total Revenue" value={formatPrice(stats.total)} color="text-[#E10600]" />
        <QuickStat label="Pending"       value={stats.pending.toString()} color="text-yellow-600" />
        <QuickStat label="Shipped"       value={stats.shipped.toString()} color="text-indigo-600" />
      </div>

      <div className="flex items-center gap-1 border-b border-[#e5e7eb] overflow-x-auto no-scrollbar">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={cn("px-4 py-2.5 text-sm font-medium transition-colors capitalize border-b-2 -mb-px whitespace-nowrap",
              status === s ? "border-[#E10600] text-[#E10600]" : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]")}>
            {s}
            <span className={cn("ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full",
              status === s ? "bg-[#E10600]/20 text-[#E10600]" : "bg-[#e5e7eb] text-[#6b7280]")}>
              {statusCounts[s] || 0}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#e5e7eb] p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order #, customer name, email..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none placeholder:text-[#6b7280]/60" />
        </div>
      </div>

      <div className="bg-white border border-[#e5e7eb] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart size={40} className="text-[#E10600] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#1a1a1a]">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#fafaf9]">
                  {["Order", "Customer", "Items", "Total", "Payment", "Status", "Date", "WA", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fafaf9] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/orders/${order.id}`} className="text-[#E10600] font-semibold hover:underline text-sm">#{order.orderNumber}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#1a1a1a]">{order.customer}</p>
                      <p className="text-[11px] text-[#6b7280]">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6b7280]">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} × items
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#1a1a1a]">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide capitalize", PAYMENT_STATUS_COLORS[order.paymentStatus])}>
                        {order.paymentStatus}
                      </span>
                      <p className="text-[10px] text-[#6b7280] mt-0.5">{order.paymentMethod}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide capitalize border", ORDER_STATUS_COLORS[order.status])}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6b7280]">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const msg = buildOrderConfirmationMessage({
                            orderNumber: order.orderNumber,
                            items: order.items,
                            total: order.total,
                            paymentMethod: order.paymentMethod,
                            customer: order.customer,
                          });
                          openWhatsApp(order.customerPhone, msg);
                        }}
                        disabled={!order.customerPhone}
                        className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-50 rounded-full transition-colors disabled:opacity-30"
                        title="Confirm via WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/orders/${order.id}`} className="text-[#6b7280] hover:text-[#E10600]"><ChevronRight size={16} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-[#6b7280] text-center">Showing {filtered.length} of {initialOrders.length} orders</p>
    </div>
  );
}

function QuickStat({ label, value, color = "text-[#1a1a1a]" }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white border border-[#e5e7eb] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] mb-1">{label}</p>
      <p className={cn("text-2xl font-bold", color)}>{value}</p>
    </div>
  );
}