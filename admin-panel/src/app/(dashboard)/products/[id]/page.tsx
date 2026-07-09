import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink, Trash, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getProductById } from "@/lib/db/repositories/products";
import { adaptProduct } from "@/lib/adapters";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { PRODUCT_STATUS_COLORS } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const dbProduct = await getProductById(id);
  if (!dbProduct) notFound();

  const product = adaptProduct(dbProduct);

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/products" className="p-2 hover:bg-white border border-[#e5e7eb] transition-colors">
            <ArrowLeft size={16} className="text-[#6b7280]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#1a1a1a]">{product.name}</h1>
              <span className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide capitalize", PRODUCT_STATUS_COLORS[product.status])}>
                {product.status}
              </span>
            </div>
            <p className="text-xs text-[#6b7280] mt-0.5 font-mono">{product.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Copy size={13} />Duplicate</Button>
          <a href={`http://localhost:3000/products/${product.slug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm"><ExternalLink size={13} />Preview</Button>
          </a>
          <Button variant="danger" size="sm"><Trash size={13} />Delete</Button>
          <Button variant="primary" size="md">Save Changes</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <div className="bg-white border border-[#e5e7eb] p-5">
            <div className="flex gap-5">
              <div className="relative w-32 h-40 flex-shrink-0 bg-[#fafaf9]">
                {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="130px" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-[#c9a96e] mb-1">{product.collection}</p>
                <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">{product.name}</h2>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-lg font-bold text-[#1a1a1a]">{formatPrice(product.price)}</p>
                  {product.comparePrice && <p className="text-sm text-[#6b7280] line-through">{formatPrice(product.comparePrice)}</p>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {product.isNew      && <Badge variant="gold">New</Badge>}
                  {product.isFeatured && <Badge variant="info">Featured</Badge>}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatBox label="Total Sales" value={formatPrice(product.price * product.sold)} />
            <StatBox label="Units Sold"  value={product.sold.toString()} />
            <StatBox label="In Stock"    value={product.stock.toString()} highlight={product.stock < 10} />
          </div>

          <div className="bg-white border border-[#e5e7eb]">
            <div className="px-5 py-3 border-b border-[#e5e7eb]">
              <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">Product Info</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4 text-sm">
              <InfoField label="SKU"        value={product.sku} />
              <InfoField label="Slug"       value={product.slug} />
              <InfoField label="Collection" value={product.collection} />
              <InfoField label="Status"     value={product.status} />
              <InfoField label="Created"    value={formatDate(product.createdAt)} />
              <InfoField label="Updated"    value={formatDate(product.updatedAt)} />
            </div>
          </div>

          <div className="bg-white border border-[#e5e7eb] p-5">
            <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-3">Variants ({dbProduct.variants.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dbProduct.variants.map((v) => (
                <div key={v.id} className="border border-[#e5e7eb] p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{v.size} / {v.color}</span>
                    <span className={cn("font-bold", v.stock === 0 ? "text-red-500" : v.stock < 5 ? "text-orange-500" : "text-green-600")}>
                      {v.stock} in stock
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6b7280] mt-1 font-mono">{v.sku}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-[#e5e7eb] p-5">
            <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-[#1a1a1a] hover:bg-[#fafaf9]">Update Stock</button>
              <button className="w-full text-left px-3 py-2 text-sm text-[#1a1a1a] hover:bg-[#fafaf9]">Add to Collection</button>
              <button className="w-full text-left px-3 py-2 text-sm text-[#1a1a1a] hover:bg-[#fafaf9]">Set Discount</button>
              <button className="w-full text-left px-3 py-2 text-sm text-[#1a1a1a] hover:bg-[#fafaf9]">Change Status</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("bg-white border p-4", highlight ? "border-orange-300 bg-orange-50" : "border-[#e5e7eb]")}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] mb-1">{label}</p>
      <p className={cn("text-xl font-bold", highlight ? "text-orange-600" : "text-[#1a1a1a]")}>{value}</p>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-[#6b7280] mb-0.5">{label}</p>
      <p className="text-sm text-[#1a1a1a] font-medium">{value}</p>
    </div>
  );
}