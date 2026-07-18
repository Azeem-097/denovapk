import { SkelBar, SkelBlock } from "@/components/ui/SkeletonPrimitives";

export default function LoadingCollectionDetail() {
  return (
    <>
      <div className="relative h-[45vh] min-h-[320px] max-h-[500px] mt-16 lg:mt-[72px] bg-[#f4f2ee] animate-pulse" />

      <div className="site-container py-8 lg:py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:gap-x-6 lg:gap-y-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <SkelBlock className="aspect-[4/5] mb-3" />
              <SkelBar w="70%" h="10px" className="mb-2" />
              <SkelBar w="50%" h="14px" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}