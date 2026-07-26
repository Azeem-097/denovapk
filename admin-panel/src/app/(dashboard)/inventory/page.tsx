import { AlertTriangle, Package } from "lucide-react";
import { getProducts } from "@/lib/db/repositories/products";
import { paisaToRupees } from "@/lib/priceUtils";
import { InventoryPageClient, type InventoryRow } from "./InventoryPageClient";

export const dynamic    = "force-dynamic";
export const revalidate = 0;

export default async function InventoryPage() {
  const dbProducts = await getProducts({ status: "ALL", limit: 200 });

  // Flatten: one ROW per VARIANT (not per product)
  const rows: InventoryRow[] = [];
  for (const p of dbProducts) {
    const primaryImg = p.images.find((i) => i.isPrimary === 1) || p.images[0];
    const image = primaryImg?.url ?? "";

    if (p.variants.length === 0) {
      // Edge case: product with no variants — show a disabled row
      rows.push({
        variantId:   `no-variant-${p.id}`,
        productId:   p.id,
        productName: p.name,
        productSlug: p.slug,
        productSku:  p.sku,
        image,
        variantSku:  p.sku,
        size:        "-",
        color:       "-",
        colorHex:    "#e5e7eb",
        stock:       0,
        price:       paisaToRupees(p.price),
        hasVariants: false,
      });
      continue;
    }

    for (const v of p.variants) {
      rows.push({
        variantId:   v.id,
        productId:   p.id,
        productName: p.name,
        productSlug: p.slug,
        productSku:  p.sku,
        image,
        variantSku:  v.sku,
        size:        v.size,
        color:       v.color,
        colorHex:    v.colorHex,
        stock:       v.stock,
        price:       paisaToRupees(v.price),
        hasVariants: true,
      });
    }
  }

  const lowCount   = rows.filter((r) => r.hasVariants && r.stock > 0 && r.stock < 10).length;
  const outCount   = rows.filter((r) => r.hasVariants && r.stock === 0).length;
  const totalUnits = rows.reduce((sum, r) => sum + r.stock, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Inventory</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">
          Manage stock levels for every size and color variant.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-orange-50 border border-orange-200 p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-orange-500" />
          <div>
            <p className="text-sm font-bold text-orange-700">{lowCount} variants low</p>
            <p className="text-xs text-orange-600">Fewer than 10 units</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 flex items-center gap-3">
          <Package size={20} className="text-red-500" />
          <div>
            <p className="text-sm font-bold text-red-700">{outCount} variants out</p>
            <p className="text-xs text-red-600">Restock needed</p>
          </div>
        </div>
        <div className="bg-[#f5f0e8] border border-[#E10600]/30 p-4 flex items-center gap-3">
          <Package size={20} className="text-[#E10600]" />
          <div>
            <p className="text-sm font-bold text-[#1a1a1a]">{totalUnits.toLocaleString()} total units</p>
            <p className="text-xs text-[#6b7280]">Across all variants</p>
          </div>
        </div>
      </div>

      <InventoryPageClient rows={rows} />
    </div>
  );
}