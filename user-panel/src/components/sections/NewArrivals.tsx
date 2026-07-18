"use client";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { SlideUp } from "@/components/animations/SlideUp";
import { ScaleIn } from "@/components/animations/ScaleIn";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

type Tab = "new" | "bestsellers";

interface Props {
  newArrivals: Product[];
  bestSellers: Product[];
}

export function NewArrivals({ newArrivals, bestSellers }: Props) {
  const [activeTab,      setActiveTab]      = useState<Tab>("new");
  const [selectedWaists, setSelectedWaists] = useState<number[]>([]);
  const [isTabSwitching, setIsTabSwitching] = useState(false);

  const tabProducts = activeTab === "new" ? newArrivals : bestSellers;

  const availableWaists = useMemo(() => {
    const set = new Set<number>();
    for (const p of tabProducts) {
      if (p.waist !== null && p.waist !== undefined) set.add(p.waist);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [tabProducts]);

  useEffect(() => {
    setSelectedWaists([]);
    setIsTabSwitching(true);
    const t = setTimeout(() => setIsTabSwitching(false), 400);
    return () => clearTimeout(t);
  }, [activeTab]);

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
    if (selectedWaists.length === 0) return tabProducts;
    return tabProducts.filter(
      (p) => p.waist !== null && p.waist !== undefined && selectedWaists.includes(p.waist)
    );
  }, [tabProducts, selectedWaists]);

  const viewAllHref = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedWaists.length > 0) {
      params.set("waist", [...selectedWaists].sort((a, b) => a - b).join(","));
    }
    const collectionSlug = activeTab === "new" ? "premium" : "super-premium";
    const query = params.toString();
    return query ? `/collections/${collectionSlug}?${query}` : `/collections/${collectionSlug}`;
  }, [activeTab, selectedWaists]);

  const waistLabel = selectedWaists.length > 0
    ? `(${[...selectedWaists].sort((a, b) => a - b).join(", ")}")`
    : "";

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#fafaf9]">
      <div className="site-container">

        <div className="text-center mb-8 lg:mb-10">
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
              Discover
            </span>
          </FadeIn>
          <TextReveal as="h2" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 block">
              Shop by Waist
            </span>
          </TextReveal>

          <FadeIn delay={200}>
            <div className="flex items-center justify-center gap-6 mt-6">
              <button
                onClick={() => setActiveTab("new")}
                className={cn(
                  "text-sm font-medium tracking-wide pb-1.5 border-b-2 transition-all duration-300",
                  activeTab === "new"
                    ? "border-[#c9a96e] text-[#1a1a1a]"
                    : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]"
                )}
              >Premium</button>
              <button
                onClick={() => setActiveTab("bestsellers")}
                className={cn(
                  "text-sm font-medium tracking-wide pb-1.5 border-b-2 transition-all duration-300",
                  activeTab === "bestsellers"
                    ? "border-[#c9a96e] text-[#1a1a1a]"
                    : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]"
                )}
              >Super Premium</button>
            </div>
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
                  className="ml-2 text-[10px] text-[#c9a96e] hover:text-[#b8955a] underline animate-fade-zoom-in"
                >
                  Clear
                </button>
              )}
            </div>
          </FadeIn>
        )}

        {displayProducts.length > 0 ? (
          <div
            key={activeTab}
            className={cn(
              "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:gap-x-6 lg:gap-y-12 transition-opacity duration-300",
              isTabSwitching ? "opacity-0" : "opacity-100"
            )}
          >
            {displayProducts.slice(0, 12).map((product, i) => (
              <div
                key={product.id}
                className={cn(
                  // Mobile shows only first 4; sm and up shows all
                  i >= 4 && "hidden sm:block"
                )}
              >
                <SlideUp stagger={70} index={i}>
                  <ProductCard product={product} />
                </SlideUp>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-zoom-in">
            <div className="w-14 h-14 bg-white border border-[#e5e7eb] rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#c9a96e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#1a1a1a] mb-1">
              No products in{" "}
              {selectedWaists.length === 1
                ? `waist size ${selectedWaists[0]}"`
                : `waist sizes ${[...selectedWaists].sort((a, b) => a - b).join(", ")}"`}
            </p>
            <button onClick={clearWaists} className="text-xs text-[#c9a96e] hover:text-[#b8955a] underline mt-1">
              Show all sizes
            </button>
          </div>
        )}

        {displayProducts.length > 0 && (
          <FadeIn delay={500}>
            <div className="text-center mt-10 lg:mt-14">
              <Link
                href={viewAllHref}
                className="shimmer-btn group inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#c9a96e] transition-all duration-300 hover-lift"
              >
                <span>View All {activeTab === "new" ? "Premium" : "Super Premium"}</span>
                {waistLabel && (
                  <span className="text-[#c9a96e] group-hover:text-white transition-colors">
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