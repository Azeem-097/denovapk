import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { FeaturedCollections } from "@/components/sections/FeaturedCollections";
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
      {/* Page header */}
      <div className="pt-10 pb-8 sm:pt-12 sm:pb-10 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="site-container">
          <FadeIn>
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Collections" }]}
              className="mb-4"
            />
          </FadeIn>
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
              Curated Edits
            </span>
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

      {/* Reuse the same premium card design from homepage */}
      <FeaturedCollections collections={collections} />
    </>
  );
}