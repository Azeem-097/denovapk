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

  // Dynamic grid: 2 items = 2 cols full width, 3 = 3 cols, 4+ = 2x2 mobile / 4 desktop
  const count = collections.length;
  const gridClass =
    count === 1 ? "grid-cols-1 max-w-2xl mx-auto" :
    count === 2 ? "grid-cols-1 sm:grid-cols-2" :
    count === 3 ? "grid-cols-2 lg:grid-cols-3" :
    "grid-cols-2 lg:grid-cols-4";

  // Taller cards when fewer items
  const aspectClass = count <= 2 ? "aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4]" : "aspect-[3/4]";

  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
              Explore
            </span>
          </FadeIn>
          <TextReveal as="h2" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-2xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-2 sm:mt-3 block">
              Our Collections
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <p className="text-[#6b7280] text-xs sm:text-base max-w-lg mx-auto mt-3 sm:mt-4 leading-relaxed px-2">
              Curated styles for every moment. From everyday essentials to statement pieces.
            </p>
          </FadeIn>
        </div>

        {/* Collections grid — adapts to number of items */}
        <div className={`grid ${gridClass} gap-4 sm:gap-6 lg:gap-8`}>
          {collections.map((collection, i) => (
            <SlideUp key={collection.id} stagger={100} index={i}>
              <Link
                href={`/collections/${collection.slug}`}
                className={`group relative block ${aspectClass} overflow-hidden bg-[#fafaf9]`}
              >
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes={count <= 2 ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
                  loading="lazy"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent sm:from-black/70 sm:via-black/20 transition-opacity duration-300 group-hover:from-black/85" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 lg:p-8">
                  <span className="text-[10px] sm:text-xs font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[#c9a96e] mb-1.5 sm:mb-2">
                    {collection.productCount} {collection.productCount === 1 ? "Product" : "Products"}
                  </span>
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                    {collection.name}
                  </h3>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 max-w-md">
                    {collection.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-wide text-white uppercase group-hover:text-[#c9a96e] transition-colors duration-300">
                    Shop Now
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </SlideUp>
          ))}
        </div>

        {/* View all link */}
        <FadeIn delay={500}>
          <div className="text-center mt-8 sm:mt-10 lg:mt-14">
            <Link
              href="/collections"
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide text-[#1a1a1a] hover:text-[#c9a96e] transition-colors duration-200"
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