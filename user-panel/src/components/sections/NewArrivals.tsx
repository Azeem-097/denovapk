"use client";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScaleIn } from "@/components/animations/ScaleIn";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface Props {
  /** Premium collection products (kept for backwards-compat with page.tsx) */
  newArrivals: Product[];
  /** Super Premium collection products (kept for backwards-compat with page.tsx) */
  bestSellers: Product[];
}

/**
 * "Shop by Waist" section — displays a unified list of products from BOTH
 * Premium and Super Premium collections, filtered by waist size.
 *
 * Previously had Premium / Super Premium tabs at the top — these were
 * removed to give customers a single, streamlined browsing experience.
 * The props (newArrivals + bestSellers) are kept so page.tsx does not
 * need to change; they are simply merged into one list.
 */
export function NewArrivals({ newArrivals, bestSellers }: Props) {
  const [selectedWaists, setSelectedWaists] = useState<number[]>([]);

  // Merge both lists, deduping by product id
  const allProducts = useMemo(() => {
    const seen = new Set<string>();
    const merged: Product[] = [];
    for (const p of [...newArrivals, ...bestSellers]) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        merged.push(p);
      }
    }
    return merged;
  }, [newArrivals, bestSellers]);

  const availableWaists = useMemo(() => {
    const set = new Set<number>();
    for (const p of allProducts) {
      if (p.waist !== null && p.waist !== undefined) set.add(p.waist);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [allProducts]);

  // Prune selected waists if underlying list changes and one is no longer available
  useEffect(() => {
    setSelectedWaists((prev) => prev.filter((w) => availableWaists.includes(w)));
  }, [availableWaists]);

  const toggleWaist = (waist: number) => {
    setSelectedWaists((prev) =>
      prev.includes(waist) ? prev.filter((w) => w !== waist) : [...prev, waist]
    );
  };

  const clearWaists = () => setSelectedWaists([]);

  const displayProducts = useMemo(() => {
    const list = selectedWaists.length === 0
      ? allProducts
      : allProducts.filter(
          (p) => p.waist !== null && p.waist !== undefined && selectedWaists.includes(p.waist)
        );
    return list;
  }, [allProducts, selectedWaists]);

  const viewAllHref = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedWaists.length > 0) {
      params.set("waist", [...selectedWaists].sort((a, b) => a - b).join(","));
    }
    const query = params.toString();
    return query ? `/shop?${query}` : `/shop`;
  }, [selectedWaists]);

  const waistLabel = selectedWaists.length > 0
    ? `(${[...selectedWaists].sort((a, b) => a - b).join(", ")}")`
    : "";

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#fafaf9]">
      <div className="site-container">

        <div className="text-center mb-8 lg:mb-10">
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#3b5f8f]">
              Discover
            </span>
          </FadeIn>
          <TextReveal as="h2" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 block">
              Shop by Waist
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <p className="text-sm sm:text-[15px] text-[#6b7280] mt-4 max-w-xl mx-auto leading-relaxed">
              Find your perfect fit — filter by waist size and explore our curated denim collection.
            </p>
          </FadeIn>
        </div>

        {availableWaists.length >= 2 && (
          <FadeIn delay={250}>
            <div className="flex items-center justify-center gap-2 mb-8 lg:mb-10 flex-wrap px-4">
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6b7280] mr-2">
                Waist:
              </span>

              <ScaleIn from={0.7} delay={0}>
                <button
                  onClick={clearWaists}
                  className={cn(
                    "min-w-[44px] h-9 px-3 text-xs font-semibold tracking-[0.1em] uppercase transition-all duration-200 border hover:scale-105 active:scale-95",
                    selectedWaists.length === 0
                      ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                      : "border-[#d1d5db] bg-white text-[#6b7280] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                  )}
                >
                  All
                </button>
              </ScaleIn>

              {availableWaists.map((waist, i) => {
                const isActive = selectedWaists.includes(waist);
                return (
                  <ScaleIn key={waist} from={0.7} delay={80 + i * 60}>
                    <button
                      onClick={() => toggleWaist(waist)}
                      className={cn(
                        "min-w-[44px] h-9 px-3 text-xs font-semibold tracking-[0.1em] transition-all duration-200 border hover:scale-105 active:scale-95",
                        isActive
                          ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                          : "border-[#d1d5db] bg-white text-[#6b7280] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                      )}
                      aria-pressed={isActive}
                    >
                      {waist}
                    </button>
                  </ScaleIn>
                );
              })}

              {selectedWaists.length > 0 && (
                <button
                  onClick={clearWaists}
                  className="ml-2 text-[10px] text-[#3b5f8f] hover:text-[#2d4a72] underline animate-fade-zoom-in"
                >
                  Clear
                </button>
              )}
            </div>
          </FadeIn>
        )}

        {displayProducts.length > 0 ? (
          <div>
            <MobileSlider products={displayProducts} />
            <DesktopSlider products={displayProducts} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-zoom-in">
            <div className="w-14 h-14 bg-white border border-[#e5e7eb] rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#3b5f8f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#1a1a1a] mb-1">
              No products in{" "}
              {selectedWaists.length === 1
                ? `waist size ${selectedWaists[0]}"`
                : `waist sizes ${[...selectedWaists].sort((a, b) => a - b).join(", ")}"`}
            </p>
            <button onClick={clearWaists} className="text-xs text-[#3b5f8f] hover:text-[#2d4a72] underline mt-1">
              Show all sizes
            </button>
          </div>
        )}

        {displayProducts.length > 0 && (
          <FadeIn delay={500}>
            <div className="text-center mt-10 lg:mt-14">
              <Link
                href={viewAllHref}
                className="shimmer-btn group inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#3b5f8f] transition-all duration-300 hover-lift"
              >
                <span>View All Products</span>
                {waistLabel && (
                  <span className="text-[#3b5f8f] group-hover:text-white transition-colors">
                    {waistLabel}
                  </span>
                )}
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
//  MOBILE SLIDER
// ═══════════════════════════════════════════════════════════
function MobileSlider({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [pageIdx, setPageIdx] = useState(0);

  const pages = useMemo(() => {
    const chunks: Product[][] = [];
    for (let i = 0; i < products.length; i += 4) {
      chunks.push(products.slice(i, i + 4));
    }
    return chunks;
  }, [products]);

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== pageIdx) setPageIdx(idx);
  }, [pageIdx]);

  const scrollToPage = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  if (pages.length === 0) return null;

  return (
    <div className="sm:hidden -mx-3">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar overscroll-x-contain"
        style={{ scrollBehavior: "auto" }}
      >
        {pages.map((page, pi) => (
          <div key={pi} className="flex-shrink-0 w-full snap-start px-3">
            <div className="grid grid-cols-2 gap-x-3 gap-y-6">
              {page.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToPage(i)}
              aria-label={`Go to page ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === pageIdx
                  ? "w-6 bg-[#1a1a1a]"
                  : "w-1.5 bg-[#d1d5db] hover:bg-[#9ca3af]"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  DESKTOP SLIDER
// ═══════════════════════════════════════════════════════════
function DesktopSlider({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, products]);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.querySelector("[data-card]") as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <div className="hidden sm:block relative group/slider">
      <div
        ref={scrollerRef}
        className="flex gap-4 lg:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth overscroll-x-contain pb-2"
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-card
            className="flex-shrink-0 snap-start w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4.5rem)/4)] 2xl:w-[calc((100%-6rem)/5)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <button
        onClick={() => scrollBy("left")}
        aria-label="Scroll left"
        className={cn(
          "absolute left-0 top-[42%] -translate-y-1/2 -translate-x-1/3 z-10",
          "w-11 h-11 rounded-full bg-white border border-[#e5e7eb] shadow-lg",
          "flex items-center justify-center text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white",
          "transition-all duration-300",
          canScrollLeft
            ? "opacity-100 lg:opacity-0 lg:group-hover/slider:opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        <ChevronLeft size={20} strokeWidth={2} />
      </button>

      <button
        onClick={() => scrollBy("right")}
        aria-label="Scroll right"
        className={cn(
          "absolute right-0 top-[42%] -translate-y-1/2 translate-x-1/3 z-10",
          "w-11 h-11 rounded-full bg-white border border-[#e5e7eb] shadow-lg",
          "flex items-center justify-center text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white",
          "transition-all duration-300",
          canScrollRight
            ? "opacity-100 lg:opacity-0 lg:group-hover/slider:opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        <ChevronRight size={20} strokeWidth={2} />
      </button>
    </div>
  );
}
