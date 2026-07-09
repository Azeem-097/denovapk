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

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
              Explore
            </span>
          </FadeIn>
          <TextReveal as="h2" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 block">
              Our Collections
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <p className="text-[#6b7280] text-sm sm:text-base max-w-lg mx-auto mt-4 leading-relaxed">
              Curated styles for every moment. From everyday essentials to statement pieces.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {collections.slice(0, 4).map((collection, i) => (
            <SlideUp key={collection.id} stagger={100} index={i}>
              <Link href={`/collections/${collection.slug}`} className="group relative block aspect-[3/4] overflow-hidden bg-[#fafaf9]">
                <Image src={collection.image} alt={collection.name} fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/80" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#c9a96e] mb-1.5">
                    {collection.productCount} Products
                  </span>
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-white mb-1.5 leading-tight">
                    {collection.name}
                  </h3>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2">
                    {collection.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-white uppercase group-hover:text-[#c9a96e] transition-colors duration-300">
                    Shop Now
                    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </SlideUp>
          ))}
        </div>

        <FadeIn delay={600}>
          <div className="text-center mt-10 lg:mt-14">
            <Link href="/collections" className="group inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-[#1a1a1a] hover:text-[#c9a96e] transition-colors duration-200">
              View All Collections
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}