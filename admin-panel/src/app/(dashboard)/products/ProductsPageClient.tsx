"use client";
import React from "react";
import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus, Search, Download, Trash, Edit,
  MoreVertical, Package, Grid3x3, List, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { PRODUCT_STATUS_COLORS } from "@/lib/constants";
import { confirmAction } from "@/store/confirmStore";
import { useToastStore } from "@/store/toastStore";
import type { AdminProduct, ProductStatus } from "@/types";

const STATUS_FILTERS: (ProductStatus | "all")[] = ["all", "published", "draft", "archived"];
type DropPosition = "before" | "after";

function getDropPosition(e: React.DragEvent<HTMLElement>, axis: "x" | "y" = "y"): DropPosition {
  const rect = e.currentTarget.getBoundingClientRect();
  if (axis === "x") {
    return e.clientX < rect.left + rect.width / 2 ? "before" : "after";
  }
  return e.clientY < rect.top + rect.height / 2 ? "before" : "after";
}

function getDragScrollSpeed(clientY: number): number {
  const edgeSize = 120;
  const maxSpeed = 26;

  if (clientY < edgeSize) {
    return -Math.ceil(((edgeSize - clientY) / edgeSize) * maxSpeed);
  }
  if (window.innerHeight - clientY < edgeSize) {
    return Math.ceil(((edgeSize - (window.innerHeight - clientY)) / edgeSize) * maxSpeed);
  }
  return 0;
}

export function ProductsPageClient({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [savedProducts, setSavedProducts] = useState(initialProducts);
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState<ProductStatus | "all">("all");
  const [view,     setView]     = useState<"table" | "grid">("table");
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; position: DropPosition } | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const dragScrollFrame = useRef<number | null>(null);
  const dragScrollSpeed = useRef(0);
  const toast = useToastStore();

  const hasOrderChanges = useMemo(
    () => products.map((p) => p.id).join("|") !== savedProducts.map((p) => p.id).join("|"),
    [products, savedProducts]
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchStatus = status === "all" || p.status === status;
      const matchSearch = search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [search, status, products]);

  const statusCounts = useMemo(() => ({
    all:       products.length,
    published: products.filter((p) => p.status === "published").length,
    draft:     products.filter((p) => p.status === "draft").length,
    archived:  products.filter((p) => p.status === "archived").length,
  }), [products]);

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
      const product = products.find((p) => p.id === id);
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

  const saveProductOrder = async () => {
    const nextProducts = products;
    setSavingOrder(true);
    try {
      const res = await fetch("/api/products/reorder", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ productIds: nextProducts.map((p) => p.id) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save product order");
      setSavedProducts(nextProducts);
      toast.success("Product order saved.", "Saved");
    } catch (err) {
      toast.error((err as Error).message, "Order Not Saved");
    } finally {
      setSavingOrder(false);
    }
  };

  const moveProduct = (fromId: string, toId: string, position: DropPosition = "before") => {
    if (fromId === toId || savingOrder) return;

    const visibleIds = filtered.map((p) => p.id);
    const fromVisibleIndex = visibleIds.indexOf(fromId);
    const toVisibleIndex = visibleIds.indexOf(toId);
    if (fromVisibleIndex === -1 || toVisibleIndex === -1) return;

    const nextProducts = [...products];
    const fromIndex = nextProducts.findIndex((p) => p.id === fromId);
    const originalToIndex = nextProducts.findIndex((p) => p.id === toId);
    let toIndex = originalToIndex;
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = nextProducts.splice(fromIndex, 1);
    if (fromIndex < originalToIndex) toIndex--;
    if (position === "after") toIndex++;
    nextProducts.splice(toIndex, 0, moved);
    const ordered = nextProducts.map((p, index) => ({ ...p, sortOrder: index }));

    setProducts(ordered);
  };

  const resetProductOrder = () => {
    setProducts(savedProducts);
    setDropTarget(null);
    setDraggingId(null);
  };

  const stopDragScroll = () => {
    dragScrollSpeed.current = 0;
    if (dragScrollFrame.current !== null) {
      window.cancelAnimationFrame(dragScrollFrame.current);
      dragScrollFrame.current = null;
    }
  };

  const updateDragScroll = (clientY: number) => {
    dragScrollSpeed.current = getDragScrollSpeed(clientY);

    if (dragScrollSpeed.current === 0) {
      stopDragScroll();
      return;
    }

    if (dragScrollFrame.current !== null) return;

    const tick = () => {
      if (dragScrollSpeed.current === 0) {
        dragScrollFrame.current = null;
        return;
      }
      window.scrollBy({ top: dragScrollSpeed.current, behavior: "auto" });
      dragScrollFrame.current = window.requestAnimationFrame(tick);
    };

    dragScrollFrame.current = window.requestAnimationFrame(tick);
  };

  return (
    <div
      className="space-y-5"
      onDragOver={(e) => {
        if (draggingId) updateDragScroll(e.clientY);
      }}
    >
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Products</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Manage your product catalog, inventory, and variants.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
              const csv = initialProducts.map((p) =>
              [p.name, p.sku, p.price, p.stock, p.sold, p.status].map((v) => `"${v}"`).join(",")
            );
              csv.unshift('"Name","SKU","Price","Stock","Sold","Status"');
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
              status === s ? "border-[#E10600] text-[#E10600]" : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]")}>
            {s}
            <span className={cn("ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full",
              status === s ? "bg-[#E10600]/20 text-[#E10600]" : "bg-[#e5e7eb] text-[#6b7280]")}>
              {statusCounts[s]}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#e5e7eb] p-3 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products or SKU..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none placeholder:text-[#6b7280]/60" />
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
      </div>

      {filtered.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#6b7280]">
            Drag products into sequence, then save once. Top positions show first on the storefront.
            {hasOrderChanges && !savingOrder && <span className="ml-2 text-orange-600 font-medium">Unsaved order changes</span>}
            {savingOrder && <span className="ml-2 text-[#E10600] font-medium">Saving order...</span>}
          </p>
          {hasOrderChanges && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={resetProductOrder} disabled={savingOrder}>
                Reset Order
              </Button>
              <Button variant="primary" size="sm" onClick={saveProductOrder} disabled={savingOrder}>
                {savingOrder ? "Saving..." : "Save Order"}
              </Button>
            </div>
          )}
        </div>
      )}

      {view === "table" ? (
        <div className="bg-white border border-[#e5e7eb] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={40} className="text-[#E10600] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#1a1a1a]">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#fafaf9]">
                    <th className="w-10 px-4 py-3" />
                    <th className="w-10 px-4 py-3"><input type="checkbox" checked={selected.length === filtered.length} onChange={toggleAll} className="accent-[#E10600]" /></th>
                    {["Product","SKU","Price","Stock","Sold","Status","Updated"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">{h}</th>
                    ))}
                    <th className="w-16 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {filtered.map((p) => (
                    <ProductRow
                      key={p.id}
                      product={p}
                      isSelected={selected.includes(p.id)}
                      isDragging={draggingId === p.id}
                      dropPosition={dropTarget?.id === p.id ? dropTarget.position : null}
                      onToggle={() => toggleOne(p.id)}
                      onDragStart={() => setDraggingId(p.id)}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDropTarget(null);
                        stopDragScroll();
                      }}
                      onDragPosition={(position) => {
                        setDropTarget(draggingId && draggingId !== p.id ? { id: p.id, position } : null);
                      }}
                      onDragScroll={updateDragScroll}
                      onDropOn={(position) => {
                        if (draggingId) moveProduct(draggingId, p.id, position);
                        setDropTarget(null);
                        setDraggingId(null);
                        stopDragScroll();
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isDragging={draggingId === p.id}
              dropPosition={dropTarget?.id === p.id ? dropTarget.position : null}
              onDragStart={() => setDraggingId(p.id)}
              onDragEnd={() => {
                setDraggingId(null);
                setDropTarget(null);
                stopDragScroll();
              }}
              onDragPosition={(position) => {
                setDropTarget(draggingId && draggingId !== p.id ? { id: p.id, position } : null);
              }}
              onDragScroll={updateDragScroll}
              onDropOn={(position) => {
                if (draggingId) moveProduct(draggingId, p.id, position);
                setDropTarget(null);
                setDraggingId(null);
                stopDragScroll();
              }}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-[#6b7280] text-center">Showing {filtered.length} of {products.length} products</p>
    </div>
  );
}

function ProductRow({
  product,
  isSelected,
  isDragging,
  dropPosition,
  onToggle,
  onDragStart,
  onDragEnd,
  onDragPosition,
  onDragScroll,
  onDropOn,
}: {
  product: AdminProduct;
  isSelected: boolean;
  isDragging: boolean;
  dropPosition: DropPosition | null;
  onToggle: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragPosition: (position: DropPosition) => void;
  onDragScroll: (clientY: number) => void;
  onDropOn: (position: DropPosition) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openUp, setOpenUp]     = useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const stockStatus = product.stock === 0 ? "out" : product.stock < 10 ? "low" : "ok";

  const handleMenuToggle = () => {
    if (!menuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUp(spaceBelow < 120);
    }
    setMenuOpen(!menuOpen);
  };

  return (
    <tr
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragScroll(e.clientY);
        onDragPosition(getDropPosition(e, "y"));
      }}
      onDragEnd={onDragEnd}
      onDrop={(e) => {
        e.preventDefault();
        onDropOn(getDropPosition(e, "y"));
      }}
      className={cn(
        "relative hover:bg-[#fafaf9] transition-colors",
        isSelected && "bg-[#f5f0e8]/30",
        dropPosition === "before" && "shadow-[inset_0_3px_0_#E10600]",
        dropPosition === "after" && "shadow-[inset_0_-3px_0_#E10600]",
        isDragging && "opacity-50"
      )}
    >
      <td className="px-4 py-3">
        <GripVertical size={16} className="text-[#9ca3af] cursor-grab active:cursor-grabbing" />
      </td>
      <td className="px-4 py-3"><input type="checkbox" checked={isSelected} onChange={onToggle} className="accent-[#E10600]" /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-14 flex-shrink-0 bg-[#fafaf9]">
            {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="45px" />}
          </div>
          <div className="min-w-0">
            <Link href={`/products/${product.id}`} className="text-sm font-semibold text-[#1a1a1a] hover:text-[#E10600] transition-colors line-clamp-1">
              {product.name}
            </Link>
            {product.isNew      && <Badge variant="gold" className="mr-1 mt-1">Premium</Badge>}
            {product.isFeatured && <Badge variant="info" className="mt-1">Featured</Badge>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs font-mono text-[#6b7280]">{product.sku}</td>
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
        <button ref={btnRef} onClick={handleMenuToggle} className="p-1 text-[#6b7280] hover:text-[#1a1a1a]">
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className={cn(
              "absolute right-4 w-40 bg-white border border-[#e5e7eb] shadow-lg z-20 py-1",
              openUp ? "bottom-full mb-1" : "top-full mt-1"
            )}>
              <Link href={`/products/${product.id}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs text-[#1a1a1a] hover:bg-[#fafaf9]">
                <Edit size={12} />Edit
              </Link>
            </div>
          </>
        )}
      </td>
    </tr>
  );
}

function ProductCard({
  product,
  isDragging,
  dropPosition,
  onDragStart,
  onDragEnd,
  onDragPosition,
  onDragScroll,
  onDropOn,
}: {
  product: AdminProduct;
  isDragging: boolean;
  dropPosition: DropPosition | null;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragPosition: (position: DropPosition) => void;
  onDragScroll: (clientY: number) => void;
  onDropOn: (position: DropPosition) => void;
}) {
  return (
    <Link
      href={`/products/${product.id}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragScroll(e.clientY);
        onDragPosition(getDropPosition(e, "x"));
      }}
      onDragEnd={onDragEnd}
      onDrop={(e) => {
        e.preventDefault();
        onDropOn(getDropPosition(e, "x"));
      }}
      onClick={(e) => {
        if (isDragging) e.preventDefault();
      }}
      className={cn(
        "group relative bg-white border border-[#e5e7eb] hover:border-[#E10600] transition-colors overflow-hidden cursor-grab active:cursor-grabbing",
        dropPosition === "before" && "shadow-[-5px_0_0_#E10600]",
        dropPosition === "after" && "shadow-[5px_0_0_#E10600]",
        isDragging && "opacity-50"
      )}
    >
      {dropPosition && (
        <span
          className={cn(
            "pointer-events-none absolute top-0 z-20 h-full w-1 bg-[#E10600]",
            dropPosition === "before" ? "left-0" : "right-0"
          )}
          aria-hidden
        />
      )}
      <div className="relative aspect-[3/4] bg-[#fafaf9]">
        <div className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center bg-white/90 border border-[#e5e7eb] text-[#6b7280] shadow-sm">
          <GripVertical size={15} />
        </div>
        {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="250px" />}
        <div className="absolute top-2 right-2">
          <span className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide capitalize", PRODUCT_STATUS_COLORS[product.status])}>
            {product.status}
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-[#1a1a1a] line-clamp-1 mb-2 group-hover:text-[#E10600]">{product.name}</p>
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
