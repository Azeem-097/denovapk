import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { SlideUp } from "@/components/animations/SlideUp";
import { getCollectionsWithCounts } from "@/lib/db/repositories/collections";
import { adaptCollection } from "@/lib/adapters";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore all curated collections from Denova PK",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CollectionsPage() {
  const dbCollections = await getCollectionsWithCounts();
  const collections = dbCollections.map(adaptCollection);

  return (
    <>
      <div className="pt-28 pb-10 sm:pt-32 sm:pb-14 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Collections" }]} className="mb-4" />
          </FadeIn>
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">Curated Edits</span>
          </FadeIn>
          <TextReveal as="h1" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-2 block">
              Shop Our Collections
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <p className="text-[#6b7280] text-sm sm:text-base max-w-xl mt-3 leading-relaxed">
              Discover thoughtfully curated collections designed for every season, occasion, and mood.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {collections.map((collection, i) => (
            <SlideUp key={collection.id} stagger={100} index={i}>
              <Link href={`/collections/${collection.slug}`} className="group relative block aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-[#fafaf9]">
                <Image src={collection.image} alt={collection.name} fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw" loading={i < 2 ? "eager" : "lazy"} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/85" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#c9a96e] mb-2">
                    {collection.productCount} Products
                  </span>
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                    {collection.name}
                  </h2>
                  <p className="text-white/70 text-sm leading-relaxed mb-4 max-w-md">{collection.description}</p>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-white uppercase group-hover:text-[#c9a96e] transition-colors duration-300">
                    Explore Collection
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </SlideUp>
          ))}
        </div>
      </div>
    </>
  );
}