"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Award, Users, TrendingUp, ArrowDown, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate, getInitials, cn } from "@/lib/utils";
import type { CustomerWithPoints } from "@/lib/db/repositories/loyalty";

interface Props {
  initialCustomers: CustomerWithPoints[];
  stats: {
    membersWithPoints:  number;
    totalOutstanding:   number;
    totalEverEarned:    number;
    totalEverRedeemed:  number;
  };
  settings: {
    enabled:          boolean;
    earningRate:      number;
    pointValue:       number;
    minRedemption:    number;
    maxRedemptionPct: number;
    programName:      string;
  };
}

export function LoyaltyClient({ initialCustomers, stats, settings }: Props) {
  const [search, setSearch] = useState("");
  const [customers] = useState(initialCustomers);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone ?? "").toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <Award size={22} className="text-[#c9a96e]" />
            {settings.programName}
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Manage customer loyalty points and rewards
          </p>
        </div>
        <Link href="/settings">
          <Button variant="outline">
            <Settings size={14} />
            Program Settings
          </Button>
        </Link>
      </div>

      {/* Status banner */}
      {!settings.enabled && (
        <div className="bg-orange-50 border border-orange-200 p-4">
          <p className="text-sm text-orange-800">
            <strong>Loyalty program is currently disabled.</strong> Enable it in{" "}
            <Link href="/settings" className="underline font-semibold">Settings</Link> to start awarding points.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Users}       label="Active Members"     value={stats.membersWithPoints.toString()} />
        <StatCard icon={Award}       label="Outstanding Points" value={stats.totalOutstanding.toLocaleString()} color="text-[#c9a96e]" />
        <StatCard icon={TrendingUp}  label="Total Earned"       value={stats.totalEverEarned.toLocaleString()}   color="text-green-600" />
        <StatCard icon={ArrowDown}   label="Total Redeemed"     value={stats.totalEverRedeemed.toLocaleString()} color="text-orange-600" />
      </div>

      {/* Program Rules */}
      <div className="bg-[#f5f0e8]/50 border border-[#c9a96e]/30 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a96e] mb-3">
          Current Program Rules
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <p className="text-[#6b7280]">Earn Rate</p>
            <p className="text-sm font-bold text-[#1a1a1a]">{settings.earningRate}% of order value</p>
          </div>
          <div>
            <p className="text-[#6b7280]">Point Value</p>
            <p className="text-sm font-bold text-[#1a1a1a]">1 pt = Rs. {settings.pointValue}</p>
          </div>
          <div>
            <p className="text-[#6b7280]">Min Redemption</p>
            <p className="text-sm font-bold text-[#1a1a1a]">{settings.minRedemption} points</p>
          </div>
          <div>
            <p className="text-[#6b7280]">Max Per Order</p>
            <p className="text-sm font-bold text-[#1a1a1a]">{settings.maxRedemptionPct}% of total</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-[#e5e7eb] p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, email, or phone..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white border border-[#e5e7eb] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Award size={40} className="text-[#c9a96e] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#1a1a1a]">No customers with points</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#fafaf9]">
                  {["Customer", "Contact", "Current Balance", "Total Earned", "Total Redeemed", "Last Activity"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#fafaf9] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#f5f0e8] flex items-center justify-center">
                          <span className="text-xs font-bold text-[#c9a96e]">{getInitials(c.name)}</span>
                        </div>
                        <Link href={`/customers/${c.id}`} className="text-sm font-semibold text-[#1a1a1a] hover:text-[#c9a96e]">
                          {c.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-[#1a1a1a]">{c.email}</p>
                      {c.phone && <p className="text-[10px] text-[#6b7280]">{c.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-lg font-bold text-[#c9a96e]">{c.loyaltyPoints}</span>
                      <span className="text-xs text-[#6b7280] ml-1">pts</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 font-semibold">
                      +{c.totalEarned}
                    </td>
                    <td className="px-4 py-3 text-sm text-orange-600 font-semibold">
                      {c.totalRedeemed > 0 ? `-${c.totalRedeemed}` : "0"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6b7280]">
                      {c.lastActivity
                        ? formatDate(new Date(c.lastActivity * 1000).toISOString())
                        : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-[#6b7280] text-center">Showing {filtered.length} of {customers.length} customers</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = "text-[#1a1a1a]" }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: string; color?: string;
}) {
  return (
    <div className="bg-white border border-[#e5e7eb] p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-[#c9a96e]" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">{label}</p>
      </div>
      <p className={cn("text-2xl font-bold", color)}>{value}</p>
    </div>
  );
}