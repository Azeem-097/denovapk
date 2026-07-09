import Image from "next/image";
import { Plus, Edit, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getCollectionsWithCounts } from "@/lib/db/repositories/collections";
import { adaptCollection } from "@/lib/adapters";
import { formatDate } from "@/lib/utils";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export default async function CollectionsPage() {
  const dbCollections = await getCollectionsWithCounts();
  const collections   = dbCollections.map(adaptCollection);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Collections</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Organize your products into collections.</p>
        </div>
        <Button variant="primary"><Plus size={14} />Add Collection</Button>
      </div>

      {collections.length === 0 ? (
        <div className="bg-white border border-[#e5e7eb] p-12 text-center">
          <p className="text-sm text-[#6b7280]">No collections yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((c) => (
            <div key={c.id} className="bg-white border border-[#e5e7eb] overflow-hidden group hover:border-[#c9a96e] transition-colors">
              <div className="relative aspect-[16/10] bg-[#fafaf9]">
                {c.image && <Image src={c.image} alt={c.name} fill className="object-cover" sizes="400px" />}
                <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white flex items-center justify-center text-[#1a1a1a]">
                  <MoreVertical size={14} />
                </button>
                {!c.isActive && <Badge variant="default" className="absolute top-2 left-2">Inactive</Badge>}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">{c.name}</h3>
                <p className="text-xs text-[#6b7280] line-clamp-2 mb-3">{c.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#c9a96e] font-semibold">{c.productCount} products</span>
                  <span className="text-[#6b7280]">Created {formatDate(c.createdAt)}</span>
                </div>
                <button className="mt-3 w-full py-2 text-xs font-semibold border border-[#e5e7eb] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors flex items-center justify-center gap-1.5">
                  <Edit size={11} />Manage Collection
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}