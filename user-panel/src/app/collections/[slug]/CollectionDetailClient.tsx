"use client";
import Image from "next/image";
import { useState, useMemo } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface Props {
  collection: {
    id:          string;
    name:        string;
    slug:        string;
    description: string;
    image:       string;
  };
  products: Product[];
}

const SORT_OPTIONS = [
  { value: "featured",   label: "Featured" },
  { value: "newest",     label: "Newest" },
  { value: "price-asc",  label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating",     label: "Top Rated" },
];

export function CollectionDetailClient({ collection, products }: Props) {
  const [sortBy,   setSortBy]   = useState("featured");
  const [sortOpen, setSortOpen] = useState(false);

  const sorted = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case "newest":     list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "price-asc":  list.sort((a,b) => a.price - b.price); break;
      case "price-desc": list.sort((a,b) => b.price - a.price); break;
      case "rating":     list.sort((a,b) => b.rating - a.rating); break;
      default:           list.sort((a,b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
    return list;
  }, [products, sortBy]);

  return (
    <>
      <div className="relative h-[45vh] min-h-[320px] max-h-[500px] mt-16 lg:mt-[72px]">
        <Image src={collection.image} alt={collection.name} fill className="object-cover" sizes="100vw" priority quality={85} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="absolute inset-0 flex items-end pb-10 sm:pb-14">
          <div className="site-container w-full">
            <FadeIn>
              <Breadcrumb items={[
                { label: "Home",        href: "/" },
                { label: "Collections", href: "/collections" },
                { label: collection.name },
              ]} className="mb-3 [&_span]:text-white/70 [&_a]:text-white/70 [&_a:hover]:text-[#3b5f8f] [&_svg]:text-white/50" />
            </FadeIn>
            <FadeIn delay={50}>
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#3b5f8f]">Collection</span>
            </FadeIn>
            <TextReveal as="h1" delay={100}>
              <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-6xl font-bold text-white mt-2 block leading-tight">
                {collection.name}
              </span>
            </TextReveal>
            <FadeIn delay={200}>
              <p className="text-white/80 text-sm sm:text-base max-w-lg mt-3 leading-relaxed">{collection.description}</p>
            </FadeIn>
          </div>
        </div>
      </div>

      <div className="site-container py-8 lg:py-10">
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#e5e7eb]">
          <p className="text-sm text-[#6b7280]">
            <span className="font-medium text-[#1a1a1a]">{sorted.length}</span> products
          </p>

          <div className="relative">
            <button onClick={() => setSortOpen(!sortOpen)}
              className="inline-flex items-center gap-2 text-sm text-[#1a1a1a] border border-[#e5e7eb] px-4 py-2 hover:border-[#1a1a1a] transition-colors">
              Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={cn("transition-transform", sortOpen && "rotate-180")}>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#e5e7eb] shadow-lg z-20 py-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={cn("block w-full text-left px-4 py-2 text-sm transition-colors",
                        sortBy === opt.value ? "bg-[#f5f0e8] text-[#3b5f8f] font-medium" : "text-[#1a1a1a] hover:bg-[#fafaf9]")}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <ProductGrid products={sorted} columns={4} />
      </div>
    </>
  );
}