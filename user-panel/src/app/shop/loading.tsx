import { SkelBar, SkelBlock } from "@/components/ui/SkeletonPrimitives";

export default function LoadingShop() {
  return (
    <>
      {/* Header skeleton */}
      <div className="pt-6 pb-8 sm:pt-8 sm:pb-10 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="site-container">
          <SkelBar w="140px" h="12px" className="mb-4" />
          <SkelBar w="240px" h="40px" />
          <SkelBar w="120px" h="12px" className="mt-3" />
        </div>
      </div>

      {/* Products grid skeleton */}
      <div className="site-container py-8 lg:py-10">
        <div className="flex gap-8 lg:gap-10">
          {/* Filter sidebar */}
          <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <SkelBar w="80px" h="12px" />
                <SkelBlock className="h-24" />
              </div>
            ))}
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:gap-x-6 lg:gap-y-12">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i}>
                  <SkelBlock className="aspect-[4/5] mb-3" />
                  <SkelBar w="70%" h="10px" className="mb-2" />
                  <SkelBar w="50%" h="14px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}