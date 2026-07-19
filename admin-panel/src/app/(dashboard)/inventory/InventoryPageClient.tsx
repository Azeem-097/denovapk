"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Check, Save, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/store/toastStore";

export interface InventoryRow {
  variantId:   string;
  productId:   string;
  productName: string;
  productSlug: string;
  productSku:  string;
  image:       string;
  variantSku:  string;
  size:        string;
  color:       string;
  colorHex:    string;
  stock:       number;
  price:       number;
  hasVariants: boolean;
}

type StockFilter = "all" | "low" | "out" | "ok";

export function InventoryPageClient({ rows }: { rows: InventoryRow[] }) {
  const router = useRouter();
  const toast  = useToastStore();

  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState<StockFilter>("all");
  const [edits,       setEdits]       = useState<Record<string, number>>({});
  const [saving,      setSaving]      = useState<Record<string, boolean>>({});
  const [savedFlash,  setSavedFlash]  = useState<Record<string, boolean>>({});

  // ─── Filter + search ────────────────────────────────
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      // Text search
      if (term) {
        const hay = `${r.productName} ${r.productSku} ${r.variantSku} ${r.color} ${r.size}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      // Status filter
      if (!r.hasVariants) return filter === "all";
      if (filter === "low") return r.stock > 0 && r.stock < 10;
      if (filter === "out") return r.stock === 0;
      if (filter === "ok")  return r.stock >= 10;
      return true;
    });
  }, [rows, search, filter]);

  // ─── Save one variant ───────────────────────────────
  const saveOne = async (row: InventoryRow) => {
    if (!row.hasVariants) return;

    const newStock = edits[row.variantId];
    if (newStock === undefined || newStock === row.stock) return;

    setSaving((s) => ({ ...s, [row.variantId]: true }));

    try {
      const res = await fetch(`/api/variants/${row.variantId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ stock: Number(newStock) }),
      });

      if (res.ok) {
        toast.success(`${row.color} / ${row.size} updated.`, "Stock Saved");
        setSavedFlash((s) => ({ ...s, [row.variantId]: true }));

        // Clear this edit from local state
        setEdits((e) => {
          const next = { ...e };
          delete next[row.variantId];
          return next;
        });

        // Refresh server data so the "Current Stock" reflects new value
        router.refresh();

        setTimeout(() => {
          setSavedFlash((s) => {
            const next = { ...s };
            delete next[row.variantId];
            return next;
          });
        }, 1800);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to update stock.", "Update Failed");
      }
    } catch {
      toast.error("Unable to connect to the server.", "Network Error");
    }

    setSaving((s) => {
      const next = { ...s };
      delete next[row.variantId];
      return next;
    });
  };

  const editedCount = Object.keys(edits).filter((vid) => {
    const row = rows.find((r) => r.variantId === vid);
    return row && edits[vid] !== row.stock;
  }).length;

  const filterButtons: Array<{ key: StockFilter; label: string }> = [
    { key: "all", label: "All"          },
    { key: "ok",  label: "In stock"     },
    { key: "low", label: "Low"          },
    { key: "out", label: "Out of stock" },
  ];

  return (
    <>
      {/* Toolbar */}
      <div className="bg-white border border-[#e5e7eb] p-3 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, SKU, color, or size..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none placeholder:text-[#6b7280]/60"
          />
        </div>

        <div className="flex items-center gap-1 border border-[#e5e7eb]">
          <Filter size={12} className="ml-2 text-[#6b7280]" />
          {filterButtons.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.key
                  ? "bg-[#1a1a1a] text-white"
                  : "text-[#6b7280] hover:text-[#1a1a1a]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {editedCount > 0 && (
          <span className="text-xs font-medium text-[#3b5f8f]">
            {editedCount} unsaved change{editedCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#fafaf9]">
                {["Product", "Variant", "SKU", "Current", "Adjust", "Update"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#6b7280]">
                    No variants match your filter.
                  </td>
                </tr>
              )}

              {filtered.map((row) => {
                const editedValue    = edits[row.variantId];
                const currentDisplay = editedValue !== undefined ? editedValue : row.stock;
                const changed        = editedValue !== undefined && editedValue !== row.stock;
                const status         =
                  !row.hasVariants ? "none"
                    : row.stock === 0 ? "out"
                    : row.stock < 10 ? "low"
                    : "ok";

                return (
                  <tr key={row.variantId} className="hover:bg-[#fafaf9] transition-colors">
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-[#fafaf9] flex-shrink-0 overflow-hidden">
                          {row.image && (
                            <Image
                              src={row.image}
                              alt={row.productName}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/products/${row.productId}`}
                            className="text-sm font-medium text-[#1a1a1a] hover:text-[#3b5f8f] line-clamp-1"
                          >
                            {row.productName}
                          </Link>
                          <p className="text-[10px] text-[#6b7280] font-mono mt-0.5">
                            {row.productSku}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Variant (color + size) */}
                    <td className="px-4 py-3">
                      {row.hasVariants ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-[#e5e7eb] flex-shrink-0"
                            style={{ backgroundColor: row.colorHex }}
                            title={row.color}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[#1a1a1a] leading-tight">
                              {row.color}
                            </p>
                            {row.size !== "ONE-SIZE" && (
                              <p className="text-[10px] text-[#6b7280] mt-0.5">
                                Waist: {row.size}&quot;
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#9ca3af] italic">No variants</span>
                      )}
                    </td>

                    {/* Variant SKU */}
                    <td className="px-4 py-3 text-xs font-mono text-[#6b7280]">
                      {row.hasVariants ? row.variantSku : "-"}
                    </td>

                    {/* Current stock */}
                    <td className="px-4 py-3">
                      {row.hasVariants ? (
                        <>
                          <span
                            className={cn(
                              "text-lg font-bold",
                              status === "out" ? "text-red-500"
                                : status === "low" ? "text-orange-500"
                                : "text-green-600"
                            )}
                          >
                            {row.stock}
                          </span>
                          {status === "low" && (
                            <p className="text-[10px] text-orange-500 mt-0.5">Low stock</p>
                          )}
                          {status === "out" && (
                            <p className="text-[10px] text-red-500 mt-0.5">Out of stock</p>
                          )}
                        </>
                      ) : (
                        <span className="text-[#9ca3af]">-</span>
                      )}
                    </td>

                    {/* Adjust */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        disabled={!row.hasVariants}
                        value={currentDisplay}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setEdits((s) => ({ ...s, [row.variantId]: val }));
                        }}
                        className={cn(
                          "w-24 px-2 py-1.5 text-sm border focus:outline-none",
                          "border-[#e5e7eb] focus:border-[#3b5f8f]",
                          "disabled:bg-[#fafaf9] disabled:text-[#9ca3af]",
                          changed && "border-[#3b5f8f] bg-[#faf7f2]"
                        )}
                      />
                    </td>

                    {/* Update */}
                    <td className="px-4 py-3">
                      {savedFlash[row.variantId] ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                          <Check size={12} />
                          Saved
                        </span>
                      ) : (
                        <button
                          onClick={() => saveOne(row)}
                          disabled={!changed || !!saving[row.variantId] || !row.hasVariants}
                          className={cn(
                            "inline-flex items-center gap-1 text-xs font-semibold underline transition-colors",
                            changed && !saving[row.variantId]
                              ? "text-[#3b5f8f] hover:text-[#2d4a72]"
                              : "text-[#9ca3af] no-underline cursor-not-allowed"
                          )}
                        >
                          <Save size={11} />
                          {saving[row.variantId] ? "Saving..." : "Save"}
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

      {rows.length > 0 && (
        <p className="text-xs text-[#6b7280] text-center">
          Showing {filtered.length} of {rows.length} variants
        </p>
      )}
    </>
  );
}