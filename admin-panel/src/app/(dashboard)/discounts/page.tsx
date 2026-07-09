import { Plus, Copy, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/lib/db/client";
import { formatDate, cn } from "@/lib/utils";
import { formatPaisa } from "@/lib/priceUtils";
import type { DbDiscount } from "@/lib/db/types";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:   "bg-green-100 text-green-700",
  EXPIRED:  "bg-gray-100 text-gray-700",
  DISABLED: "bg-red-100 text-red-700",
};

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export default async function DiscountsPage() {
  const result = await db.execute("SELECT * FROM discounts ORDER BY createdAt DESC");
  const discounts = result.rows as unknown as DbDiscount[];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Discounts</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Create and manage discount codes.</p>
        </div>
        <Button variant="primary"><Plus size={14} />Create Discount</Button>
      </div>

      <div className="bg-white border border-[#e5e7eb] overflow-hidden">
        {discounts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-[#6b7280]">No discount codes yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#fafaf9]">
                  {["Code", "Type", "Value", "Min Order", "Uses", "Expires", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {discounts.map((d) => (
                  <tr key={d.id} className="hover:bg-[#fafaf9]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#c9a96e]">{d.code}</span>
                        <button className="text-[#6b7280] hover:text-[#1a1a1a]"><Copy size={12} /></button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#1a1a1a] capitalize">{d.type.toLowerCase()}</td>
                    <td className="px-4 py-3 text-xs font-bold text-[#1a1a1a]">
                      {d.type === "PERCENTAGE" ? `${d.value}%` : formatPaisa(d.value)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6b7280]">{formatPaisa(d.minOrder)}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-[#1a1a1a]">{d.usedCount} / {d.maxUses}</p>
                      <div className="w-20 h-1 bg-[#e5e7eb] mt-1">
                        <div className="h-full bg-[#c9a96e]" style={{ width: `${(d.usedCount / d.maxUses) * 100}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6b7280]">{formatDate(new Date(d.expiresAt * 1000).toISOString())}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn(STATUS_COLORS[d.status], "capitalize")}>{d.status.toLowerCase()}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-[#6b7280] hover:text-[#1a1a1a]"><MoreVertical size={14} /></button>
                    </td>
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