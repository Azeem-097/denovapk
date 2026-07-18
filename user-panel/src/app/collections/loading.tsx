import { SkelBar, SkelBlock } from "@/components/ui/SkeletonPrimitives";

export default function LoadingCollections() {
  return (
    <>
      <div className="pt-10 pb-8 sm:pt-12 sm:pb-10 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="site-container">
          <SkelBar w="180px" h="12px" className="mb-4" />
          <SkelBar w="140px" h="12px" className="mb-2" />
          <SkelBar w="380px" h="40px" />
          <SkelBar w="70%" h="12px" className="mt-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkelBlock key={i} className="aspect-square" />
        ))}
      </div>
    </>
  );
}