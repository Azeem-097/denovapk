"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { SlideUp } from "@/components/animations/SlideUp";
import type { Collection } from "@/types";

interface Props {
  collections: Collection[];
}

export function FeaturedCollections({ collections }: Props) {
  if (collections.length === 0) return null;

  const count = collections.length;
  const gridClass =
    count === 1 ? "grid-cols-1" :
    count === 2 ? "grid-cols-1 sm:grid-cols-2" :
    count === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-white">

      <div className="site-container">
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#E10600]">
              Explore
            </span>
          </FadeIn>
          <TextReveal as="h2" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-2 sm:mt-3 block">
              Our Collections
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <p className="text-[#6b7280] text-sm sm:text-base max-w-lg mx-auto mt-3 sm:mt-4 leading-relaxed px-2">
              Curated styles for every moment. From everyday essentials to statement pieces.
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Grid — full bleed, no gaps */}
      <div className={`grid ${gridClass} gap-0 w-full`}>
        {collections.map((collection, i) => (
          <SlideUp key={collection.id} stagger={140} index={i}>
            <CollectionCard collection={collection} />
          </SlideUp>
        ))}
      </div>

      <div className="site-container">
        <FadeIn delay={500}>
          <div className="text-center mt-10 sm:mt-14 lg:mt-16">
            <Link
              href="/shop"
              className="group relative inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] hover:text-[#E10600] transition-colors duration-200 whitespace-nowrap pb-1"
            >
              <span>View All Collections</span>
              <ArrowRight
                size={14}
                className="sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1.5 flex-shrink-0"
              />
              {/* Animated underline */}
              <span className="absolute left-0 right-0 bottom-0 h-px bg-[#E10600] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-400" />
            </Link>
          </div>
        </FadeIn>
      </div>

    </section>
  );
}

function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <div
      className="group relative block aspect-square overflow-hidden bg-[#111]"
      aria-label={collection.name}
    >
      {collection.image && (
        <Image
          src={collection.image}
          alt={collection.name}
          fill
          className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, 50vw"
          loading="lazy"
          unoptimized={collection.image.startsWith("/uploads")}
        />
      )}

      {/* Overlay — darkens on hover */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-700" />

      {/* Radial vignette that reveals on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Collection name — subtle lift + gold underline draws in on hover */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="relative">
          <h3 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white text-center leading-none tracking-tight drop-shadow-2xl transition-all duration-700 group-hover:-translate-y-2">
            {collection.name}
          </h3>
          {/* Gold underline — draws from center on hover */}
          <div className="mt-3 flex justify-center">
            <span
              className="block h-[2px] w-[60px] bg-[#E10600] scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
