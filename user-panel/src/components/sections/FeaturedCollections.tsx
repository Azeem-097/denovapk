"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { SlideUp } from "@/components/animations/SlideUp";
import type { Collection } from "@/types";

interface Props {
  collections: Collection[];
}

// ─── Format price range string ───────────────────────────
function formatPriceRange(collection: Collection): string {
  const min = collection.minPrice;
  const max = collection.maxPrice;

  if (min == null || max == null || collection.productCount === 0) {
    return "";
  }

  const fmt = (n: number) => `${Math.round(n).toLocaleString("en-PK")} PKR`;

  if (min === max) {
    return fmt(min);
  }

  return `${fmt(min)}  -  ${fmt(max)}`;
}

export function FeaturedCollections({ collections }: Props) {
  if (collections.length === 0) return null;

  // Dynamic grid layout based on count
  const count = collections.length;
  const gridClass =
    count === 1 ? "grid-cols-1 max-w-xl mx-auto" :
    count === 2 ? "grid-cols-1 sm:grid-cols-2" :
    count === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ────────────────────────── */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
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

        {/* ── Collections grid ──────────────────────── */}
        <div className={`grid ${gridClass} gap-5 sm:gap-6 lg:gap-7`}>
          {collections.map((collection, i) => (
            <SlideUp key={collection.id} stagger={100} index={i}>
              <CollectionCard collection={collection} />
            </SlideUp>
          ))}
        </div>

        {/* ── View all link ─────────────────────────── */}
        <FadeIn delay={500}>
          <div className="text-center mt-10 sm:mt-14 lg:mt-16">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] hover:text-[#c9a96e] transition-colors duration-200"
            >
              View All Collections
              <ArrowRight
                size={14}
                className="sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
//  COLLECTION CARD (Premium design)
// ══════════════════════════════════════════════════════════
function CollectionCard({ collection }: { collection: Collection }) {
  const priceRange = formatPriceRange(collection);
  const categoryLabel = collection.name.toUpperCase();

  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group relative block aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-[#111] shadow-lg hover:shadow-2xl transition-shadow duration-500"
    >
      {/* ── Background image ───────────────────────── */}
      {collection.image && (
        <Image
          src={collection.image}
          alt={collection.name}
          fill
          className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          unoptimized={collection.image.startsWith("/uploads")}
        />
      )}

      {/* ── Dark overlay — strong at bottom, subtle at top ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10 transition-opacity duration-500 group-hover:from-black/95" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />

      {/* ── Content ────────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-7 lg:p-8">

        {/* Category label with divider */}
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-[#c9a96e]">
            {categoryLabel}
          </span>
          <span className="flex-1 h-px bg-gradient-to-r from-[#c9a96e]/60 to-transparent max-w-[60px]" />
        </div>

        {/* Title (big serif) */}
        <h3 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-[1.05] tracking-tight">
          {collection.name}
        </h3>

        {/* Description */}
        {collection.description && (
          <p className="text-white/85 text-sm sm:text-[15px] leading-relaxed mb-5 sm:mb-6 line-clamp-2 max-w-md">
            {collection.description}
          </p>
        )}

        {/* Explore button */}
        <div className="mb-4 sm:mb-5">
          <span className="inline-flex items-center justify-between gap-4 w-full sm:w-auto sm:min-w-[240px] border border-[#c9a96e]/60 group-hover:border-[#c9a96e] bg-transparent group-hover:bg-[#c9a96e] text-[#c9a96e] group-hover:text-white px-6 py-3 sm:py-3.5 text-xs sm:text-[13px] font-semibold tracking-[0.2em] uppercase transition-all duration-300">
            Explore Collection
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </div>

        {/* Price range (bottom info) */}
        {priceRange && (
          <div className="flex items-center gap-2 text-[#c9a96e]">
            <Tag size={13} className="flex-shrink-0" strokeWidth={2} />
            <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase">
              PRICE: {priceRange}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}