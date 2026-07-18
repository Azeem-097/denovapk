import { SkelBar, SkelBlock } from "@/components/ui/SkeletonPrimitives";

export default function LoadingAbout() {
  return (
    <>
      <div className="relative h-[55vh] min-h-[400px] max-h-[600px] mt-16 lg:mt-[72px] bg-[#f4f2ee] animate-pulse" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center space-y-4">
        <SkelBar w="180px" h="12px" className="mx-auto" />
        <SkelBar w="60%" h="40px" className="mx-auto" />
        <SkelBar w="85%" h="14px" className="mx-auto" />
        <SkelBar w="80%" h="14px" className="mx-auto" />
        <SkelBar w="82%" h="14px" className="mx-auto" />
      </div>
    </>
  );
}