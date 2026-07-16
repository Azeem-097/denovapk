"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus, Search, Download, Trash, Edit,
  MoreVertical, Package, Grid3x3, List,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { PRODUCT_STATUS_COLORS } from "@/lib/constants";
import { confirmAction } from "@/store/confirmStore";
import { useToastStore } from "@/store/toastStore";
import type { AdminProduct, ProductStatus } from "@/types";

const STATUS_FILTERS: (ProductStatus | "all")[] = ["all", "published", "draft", "archived"];

export function ProductsPageClient({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState<ProductStatus | "all">("all");
  const [view,     setView]     = useState<"table" | "grid">("table");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const toast = useToastStore();

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchStatus = status === "all" || p.status === status;
      const matchSearch = search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCollection = collectionFilter === "all" || p.collection === collectionFilter;
      return matchStatus && matchSearch && matchCollection;
    });
  }, [search, status, initialProducts, collectionFilter]);

  const statusCounts = useMemo(() => ({
    all:       initialProducts.length,
    published: initialProducts.filter((p) => p.status === "published").length,
    draft:     initialProducts.filter((p) => p.status === "draft").length,
    archived:  initialProducts.filter((p) => p.status === "archived").length,
  }), [initialProducts]);

  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map((p) => p.id));
  const toggleOne = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const handleBulkDelete = async () => {
    const ok = await confirmAction({
      title:       "Delete Products",
      message:     `Permanently delete ${selected.length} product${selected.length === 1 ? "" : "s"}? This will also remove them from any order history. This action cannot be undone.`,
      confirmText: "Delete",
      cancelText:  "Keep them",
      variant:     "danger",
    });
    if (!ok) return;

    setDeleting(true);

    let success = 0;
    const failures: Array<{ id: string; name: string; error: string }> = [];

    for (const id of selected) {
      const product = initialProducts.find((p) => p.id === id);
      const name    = product?.name ?? id;
      try {
        const res  = await fetch(`/api/products/${id}`, { method: "DELETE" });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          success++;
        } else {
          failures.push({ id, name, error: data.error ?? `HTTP ${res.status}` });
        }
      } catch (err) {
        failures.push({ id, name, error: (err as Error).message });
      }
    }

    setSelected([]);
    setDeleting(false);

    if (success > 0) {
      toast.success(
        `${success} product${success === 1 ? "" : "s"} deleted successfully.`,
        "Deleted"
      );
    }
    if (failures.length > 0) {
      const first = failures[0];
      toast.error(
        `Failed to delete ${failures.length} product${failures.length === 1 ? "" : "s"}. Example: "${first.name}" — ${first.error}`,
        "Some Deletes Failed"
      );
      console.error("Delete failures:", failures);
    }

    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Products</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Manage your product catalog, inventory, and variants.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
              const csv = initialProducts.map((p) =>
                [p.name, p.sku, p.collection, p.price, p.stock, p.sold, p.status].map((v) => `"${v}"`).join(",")
              );
              csv.unshift('"Name","SKU","Collection","Price","Stock","Sold","Status"');
              const blob = new Blob([csv.join("\n")], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `denova-products-${new Date().toISOString().split("T")[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Product catalog exported to CSV.", "Export Complete");
            }}>
              <Download size={14} />
              Export
            </Button>
          <Link href="/products/new"><Button variant="primary"><Plus size={14} />Add Product</Button></Link>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-[#e5e7eb]">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={cn("px-4 py-2.5 text-sm font-medium transition-colors capitalize border-b-2 -mb-px",
              status === s ? "border-[#c9a96e] text-[#c9a96e]" : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]")}>
            {s}
            <span className={cn("ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full",
              status === s ? "bg-[#c9a96e]/20 text-[#c9a96e]" : "bg-[#e5e7eb] text-[#6b7280]")}>
              {statusCounts[s]}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#e5e7eb] p-3 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, SKU, collection..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none placeholder:text-[#6b7280]/60" />
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6b7280]">{selected.length} selected</span>
            <Button variant="ghost" size="sm" onClick={handleBulkDelete} disabled={deleting}>
              <Trash size={13} />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        )}

        <div className="flex items-center gap-1 border border-[#e5e7eb] p-0.5 ml-auto">
          <button onClick={() => setView("table")} className={cn("p-1.5", view === "table" ? "bg-[#1a1a1a] text-white" : "text-[#6b7280]")}><List size={14} /></button>
          <button onClick={() => setView("grid")}  className={cn("p-1.5", view === "grid"  ? "bg-[#1a1a1a] text-white" : "text-[#6b7280]")}><Grid3x3 size={14} /></button>
        </div>
        <select value={collectionFilter} onChange={(e) => setCollectionFilter(e.target.value)}
          className="text-xs border border-[#e5e7eb] px-3 py-2 focus:border-[#c9a96e] focus:outline-none bg-white">
          <option value="all">All Collections</option>
          <option value="Premium">Premium</option>
          <option value="Super Premium">Super Premium</option>
        </select>
      </div>

      {view === "table" ? (
        <div className="bg-white border border-[#e5e7eb] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={40} className="text-[#c9a96e] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#1a1a1a]">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#fafaf9]">
                    <th className="w-10 px-4 py-3"><input type="checkbox" checked={selected.length === filtered.length} onChange={toggleAll} className="accent-[#c9a96e]" /></th>
                    {["Product","SKU","Collection","Price","Stock","Sold","Status","Updated"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">{h}</th>
                    ))}
                    <th className="w-16 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {filtered.map((p) => (
                    <ProductRow key={p.id} product={p} isSelected={selected.includes(p.id)} onToggle={() => toggleOne(p.id)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      <p className="text-xs text-[#6b7280] text-center">Showing {filtered.length} of {initialProducts.length} products</p>
    </div>
  );
}

function ProductRow({ product, isSelected, onToggle }: { product: AdminProduct; isSelected: boolean; onToggle: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const stockStatus = product.stock === 0 ? "out" : product.stock < 10 ? "low" : "ok";

  return (
    <tr className={cn("hover:bg-[#fafaf9] transition-colors", isSelected && "bg-[#f5f0e8]/30")}>
      <td className="px-4 py-3"><input type="checkbox" checked={isSelected} onChange={onToggle} className="accent-[#c9a96e]" /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-14 flex-shrink-0 bg-[#fafaf9]">
            {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="45px" />}
          </div>
          <div className="min-w-0">
            <Link href={`/products/${product.id}`} className="text-sm font-semibold text-[#1a1a1a] hover:text-[#c9a96e] transition-colors line-clamp-1">
              {product.name}
            </Link>
            {product.isNew      && <Badge variant="gold" className="mr-1 mt-1">New</Badge>}
            {product.isFeatured && <Badge variant="info" className="mt-1">Featured</Badge>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs font-mono text-[#6b7280]">{product.sku}</td>
      <td className="px-4 py-3 text-xs text-[#1a1a1a]">{product.collection}</td>
      <td className="px-4 py-3">
        <p className="text-xs font-bold text-[#1a1a1a]">{formatPrice(product.price)}</p>
        {product.comparePrice && <p className="text-[10px] text-[#6b7280] line-through">{formatPrice(product.comparePrice)}</p>}
      </td>
      <td className="px-4 py-3">
        <span className={cn("text-xs font-bold",
          stockStatus === "out" ? "text-red-500" : stockStatus === "low" ? "text-orange-500" : "text-[#1a1a1a]")}>
          {product.stock}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-[#6b7280]">{product.sold}</td>
      <td className="px-4 py-3">
        <span className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide capitalize", PRODUCT_STATUS_COLORS[product.status])}>
          {product.status}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-[#6b7280]">{formatDate(product.updatedAt)}</td>
      <td className="px-4 py-3 relative">
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-[#6b7280] hover:text-[#1a1a1a]">
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-4 top-full mt-1 w-40 bg-white border border-[#e5e7eb] shadow-lg z-20 py-1">
              <Link href={`/products/${product.id}`} className="flex items-center gap-2 px-3 py-2 text-xs text-[#1a1a1a] hover:bg-[#fafaf9]">
                <Edit size={12} />Edit
              </Link>
            </div>
          </>
        )}
      </td>
    </tr>
  );
}

function ProductCard({ product }: { product: AdminProduct }) {
  return (
    <Link href={`/products/${product.id}`} className="group bg-white border border-[#e5e7eb] hover:border-[#c9a96e] transition-colors overflow-hidden">
      <div className="relative aspect-[3/4] bg-[#fafaf9]">
        {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="250px" />}
        <div className="absolute top-2 right-2">
          <span className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide capitalize", PRODUCT_STATUS_COLORS[product.status])}>
            {product.status}
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[10px] text-[#c9a96e] uppercase tracking-wider mb-1">{product.collection}</p>
        <p className="text-sm font-semibold text-[#1a1a1a] line-clamp-1 mb-2 group-hover:text-[#c9a96e]">{product.name}</p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[#1a1a1a]">{formatPrice(product.price)}</p>
          <span className={cn("text-xs font-bold", product.stock === 0 ? "text-red-500" : product.stock < 10 ? "text-orange-500" : "text-green-600")}>
            {product.stock} in stock
          </span>
        </div>
      </div>
    </Link>
  );
}