"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Download, Search, Mail, Phone, ChevronRight, Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate, getInitials, cn } from "@/lib/utils";
import { openWhatsApp, buildCustomerContactMessage } from "@/lib/whatsapp";
import type { AdminCustomer } from "@/types";

export function CustomersPageClient({ initialCustomers }: { initialCustomers: AdminCustomer[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "vip">("all");

  const filtered = useMemo(() => {
    return initialCustomers.filter((c) => {
      let matchFilter = true;
      if (filter === "active")   matchFilter = c.isActive;
      if (filter === "inactive") matchFilter = !c.isActive;
      if (filter === "vip")      matchFilter = c.totalSpent > 100000;

      const matchSearch = search.trim() === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [search, filter, initialCustomers]);

  const stats = useMemo(() => ({
    total:   initialCustomers.length,
    active:  initialCustomers.filter((c) => c.isActive).length,
    vip:     initialCustomers.filter((c) => c.totalSpent > 100000).length,
    revenue: initialCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
  }), [initialCustomers]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Customers</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">View and manage all your customers.</p>
        </div>
        <Button variant="outline"><Download size={14} />Export List</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickStat label="Total Customers"   value={stats.total.toString()} />
        <QuickStat label="Active"            value={stats.active.toString()}   color="text-green-600" />
        <QuickStat label="VIP (100K+)"       value={stats.vip.toString()}      color="text-[#3b5f8f]" />
        <QuickStat label="Combined Revenue"  value={formatPrice(stats.revenue)} color="text-[#1a1a1a]" />
      </div>

      <div className="flex items-center gap-1 border-b border-[#e5e7eb]">
        {[
          { val: "all",      label: "All" },
          { val: "active",   label: "Active" },
          { val: "inactive", label: "Inactive" },
          { val: "vip",      label: "VIP" },
        ].map((f) => (
          <button key={f.val} onClick={() => setFilter(f.val as typeof filter)}
            className={cn("px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              filter === f.val ? "border-[#3b5f8f] text-[#3b5f8f]" : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]")}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#e5e7eb] p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or city..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none placeholder:text-[#6b7280]/60" />
        </div>
      </div>

      <div className="bg-white border border-[#e5e7eb] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} className="text-[#3b5f8f] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#1a1a1a]">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#fafaf9]">
                  {["Customer", "Contact", "Location", "Orders", "Total Spent", "Last Order", "Status", "WA", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#fafaf9] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#f5f0e8] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#3b5f8f]">{getInitials(c.name)}</span>
                        </div>
                        <div>
                          <Link href={`/customers/${c.id}`} className="text-sm font-semibold text-[#1a1a1a] hover:text-[#3b5f8f]">
                            {c.name}
                          </Link>
                          {c.totalSpent > 100000 && <Badge variant="gold" className="ml-1">VIP</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#3b5f8f]"><Mail size={11} />{c.email}</a>
                        {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#3b5f8f]"><Phone size={11} />{c.phone}</a>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#1a1a1a]">{c.city || "-"}</td>
                    <td className="px-4 py-3 text-xs font-bold text-[#1a1a1a]">{c.totalOrders}</td>
                    <td className="px-4 py-3 text-xs font-bold text-[#3b5f8f]">{formatPrice(c.totalSpent)}</td>
                    <td className="px-4 py-3 text-xs text-[#6b7280]">{formatDate(c.lastOrder)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide",
                        c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.phone && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openWhatsApp(c.phone, buildCustomerContactMessage(c.name));
                          }}
                          className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-50 rounded-full transition-colors"
                          title="Contact via WhatsApp"
                        >
                          <MessageCircle size={14} />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/customers/${c.id}`} className="text-[#6b7280] hover:text-[#3b5f8f]"><ChevronRight size={16} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-[#6b7280] text-center">Showing {filtered.length} of {initialCustomers.length} customers</p>
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