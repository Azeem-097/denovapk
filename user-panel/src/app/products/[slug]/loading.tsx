import { SkelBar, SkelBlock } from "@/components/ui/SkeletonPrimitives";

export default function LoadingProductDetail() {
  return (
    <div className="pt-24 sm:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:gap-14">

          {/* Image gallery skeleton */}
          <div className="grid grid-cols-2 gap-2 lg:gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkelBlock key={i} className="aspect-[4/5]" />
            ))}
          </div>

          {/* Info column skeleton */}
          <div className="space-y-4">
            <SkelBar w="80%" h="18px" />
            <SkelBar w="40%" h="12px" />
            <SkelBar w="55%" h="28px" className="mt-4" />

            <div className="pt-6">
              <SkelBar w="60px" h="12px" className="mb-3" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkelBlock key={i} className="w-10 h-10 rounded-full" />
                ))}
              </div>
            </div>

            <div className="pt-2">
              <SkelBar w="60px" h="12px" className="mb-3" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkelBlock key={i} className="w-14 h-14" />
                ))}
              </div>
            </div>

            <SkelBlock className="h-14 mt-6" />
            <SkelBar w="90%" h="12px" className="mt-4" />
            <SkelBar w="80%" h="12px" />
            <SkelBar w="85%" h="12px" />
          </div>
        </div>
      </div>
    </div>
  );
}