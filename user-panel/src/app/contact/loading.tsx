import { SkelBar, SkelBlock } from "@/components/ui/SkeletonPrimitives";

export default function LoadingContact() {
  return (
    <>
      <div className="pt-28 pb-10 sm:pt-32 sm:pb-14 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkelBar w="140px" h="12px" className="mb-4" />
          <SkelBar w="140px" h="12px" className="mb-2" />
          <SkelBar w="440px" h="40px" />
          <SkelBar w="70%" h="14px" className="mt-3" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">
          <SkelBlock className="h-[520px]" />
          <div className="space-y-6">
            <SkelBlock className="h-[280px]" />
            <SkelBlock className="h-[180px]" />
            <SkelBlock className="h-[280px]" />
          </div>
        </div>
      </div>
    </>
  );
}