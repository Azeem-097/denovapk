"use client";
import Image from "next/image";
import Link from "next/link";
import { Search, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AdminProduct } from "@/types";

export function InventoryPageClient({ products }: { products: AdminProduct[] }) {
  const [search, setSearch] = useState("");
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const updateStock = (productId: string, value: number) => {
    setStockChanges((prev) => ({ ...prev, [productId]: value }));
  };

  const saveStock = async (productId: string) => {
    const newStock = stockChanges[productId];
    if (newStock === undefined) return;

    setSaving((prev) => ({ ...prev, [productId]: true }));
    try {
      // Note: This updates the FIRST variant. For real multi-variant, would iterate.
      // For now, we use this simple pattern.
      const res = await fetch(`/api/inventory/${productId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        setSaved((prev) => ({ ...prev, [productId]: true }));
        setTimeout(() => {
          setSaved((prev) => { const p = { ...prev }; delete p[productId]; return p; });
        }, 2000);
      } else {
        alert("Failed to update");
      }
    } catch {
      alert("Network error");
    }
    setSaving((prev) => ({ ...prev, [productId]: false }));
  };

  return (
    <>
      <div className="bg-white border border-[#e5e7eb] p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products or SKU..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none placeholder:text-[#6b7280]/60" />
        </div>
      </div>

      <div className="bg-white border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#fafaf9]">
                {["Product", "SKU", "Current Stock", "Adjust", "Update"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {filtered.map((p) => {
                const status = p.stock === 0 ? "out" : p.stock < 10 ? "low" : "ok";
                const changed = stockChanges[p.id] !== undefined && stockChanges[p.id] !== p.stock;
                return (
                  <tr key={p.id} className="hover:bg-[#fafaf9]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-[#fafaf9] flex-shrink-0">
                          {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />}
                        </div>
                        <Link href={`/products/${p.id}`} className="text-sm font-medium text-[#1a1a1a] hover:text-[#c9a96e]">{p.name}</Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[#6b7280]">{p.sku}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-lg font-bold",
                        status === "out" ? "text-red-500" : status === "low" ? "text-orange-500" : "text-green-600")}>
                        {p.stock}
                      </span>
                      {status === "low" && <p className="text-[10px] text-orange-500">Low stock</p>}
                      {status === "out" && <p className="text-[10px] text-red-500">Out of stock</p>}
                    </td>
                    <td className="px-4 py-3">
                      <input type="number"
                        defaultValue={p.stock}
                        onChange={(e) => updateStock(p.id, Number(e.target.value))}
                        className="w-24 px-2 py-1.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none" />
                    </td>
                    <td className="px-4 py-3">
                      {saved[p.id] ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                          <Check size={12} />Saved
                        </span>
                      ) : (
                        <button
                          onClick={() => saveStock(p.id)}
                          disabled={!changed || saving[p.id]}
                          className="text-xs font-semibold text-[#c9a96e] hover:text-[#b8955a] underline disabled:opacity-40 disabled:no-underline">
                          {saving[p.id] ? "Saving..." : "Save"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}