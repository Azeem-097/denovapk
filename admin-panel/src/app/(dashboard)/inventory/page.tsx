import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Package } from "lucide-react";
import { getProducts } from "@/lib/db/repositories/products";
import { adaptProduct } from "@/lib/adapters";
import { InventoryPageClient } from "./InventoryPageClient";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export default async function InventoryPage() {
  const dbProducts = await getProducts({ status: "ALL", limit: 200 });
  const products   = dbProducts.map(adaptProduct);

  const lowStock = products.filter((p) => p.stock < 10 && p.stock > 0).length;
  const outStock = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Inventory</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">Manage stock levels across all products.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-orange-50 border border-orange-200 p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-orange-500" />
          <div>
            <p className="text-sm font-bold text-orange-700">{lowStock} products low in stock</p>
            <p className="text-xs text-orange-600">Below 10 units remaining</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 flex items-center gap-3">
          <Package size={20} className="text-red-500" />
          <div>
            <p className="text-sm font-bold text-red-700">{outStock} products out of stock</p>
            <p className="text-xs text-red-600">Restock immediately</p>
          </div>
        </div>
      </div>

      <InventoryPageClient products={products} />
    </div>
  );
}