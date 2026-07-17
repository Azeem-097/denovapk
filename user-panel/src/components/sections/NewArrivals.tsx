"use client";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { SlideUp } from "@/components/animations/SlideUp";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

type Tab = "new" | "bestsellers";

interface Props {
  newArrivals: Product[];
  bestSellers: Product[];
}

export function NewArrivals({ newArrivals, bestSellers }: Props) {
  const [activeTab, setActiveTab]     = useState<Tab>("new");
  const [activeWaist, setActiveWaist] = useState<number | null>(null); // null = "All"

  // Products for the current tab
  const tabProducts = activeTab === "new" ? newArrivals : bestSellers;

  // ─── Compute unique waist sizes for current tab ──────
  const availableWaists = useMemo(() => {
    const set = new Set<number>();
    for (const p of tabProducts) {
      if (p.waist !== null && p.waist !== undefined) {
        set.add(p.waist);
      }
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [tabProducts]);

  // Reset waist filter when tab changes
  useEffect(() => {
    setActiveWaist(null);
  }, [activeTab]);

  // ─── Filter products by selected waist ───────────────
  const displayProducts = useMemo(() => {
    if (activeWaist === null) return tabProducts;
    return tabProducts.filter((p) => p.waist === activeWaist);
  }, [tabProducts, activeWaist]);

  // ─── "View All" href — includes waist if selected ────
  const viewAllHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("filter", activeTab === "new" ? "new" : "bestsellers");
    if (activeWaist !== null) params.set("waist", String(activeWaist));
    return `/shop?${params.toString()}`;
  }, [activeTab, activeWaist]);

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#fafaf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Header ─── */}
        <div className="text-center mb-8 lg:mb-10">
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
              Discover
            </span>
          </FadeIn>
          <TextReveal as="h2" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 block">
              Trending Now
            </span>
          </TextReveal>

          {/* Tabs */}
          <FadeIn delay={200}>
            <div className="flex items-center justify-center gap-6 mt-6">
              <button
                onClick={() => setActiveTab("new")}
                className={cn(
                  "text-sm font-medium tracking-wide pb-1.5 border-b-2 transition-all duration-200",
                  activeTab === "new"
                    ? "border-[#c9a96e] text-[#1a1a1a]"
                    : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]"
                )}
              >
                New Arrivals
              </button>
              <button
                onClick={() => setActiveTab("bestsellers")}
                className={cn(
                  "text-sm font-medium tracking-wide pb-1.5 border-b-2 transition-all duration-200",
                  activeTab === "bestsellers"
                    ? "border-[#c9a96e] text-[#1a1a1a]"
                    : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]"
                )}
              >
                Best Sellers
              </button>
            </div>
          </FadeIn>
        </div>

        {/* ═══════════════════════════════════════════════
            WAIST FILTER ROW — only if 2+ unique sizes
            ═══════════════════════════════════════════════ */}
        {availableWaists.length >= 2 && (
          <FadeIn delay={250}>
            <div className="flex items-center justify-center gap-2 mb-8 lg:mb-10 flex-wrap px-4">
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6b7280] mr-2">
                Waist:
              </span>

              {/* All pill */}
              <button
                onClick={() => setActiveWaist(null)}
                className={cn(
                  "min-w-[44px] h-9 px-3 text-xs font-semibold tracking-[0.1em] uppercase transition-all duration-150 border",
                  activeWaist === null
                    ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                    : "border-[#d1d5db] bg-white text-[#6b7280] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                )}
              >
                All
              </button>

              {/* Waist pills */}
              {availableWaists.map((waist) => {
                const isActive = activeWaist === waist;
                return (
                  <button
                    key={waist}
                    onClick={() => setActiveWaist(isActive ? null : waist)}
                    className={cn(
                      "min-w-[44px] h-9 px-3 text-xs font-semibold tracking-[0.1em] transition-all duration-150 border",
                      isActive
                        ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                        : "border-[#d1d5db] bg-white text-[#6b7280] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                    )}
                    aria-pressed={isActive}
                  >
                    {waist}
                  </button>
                );
              })}
            </div>
          </FadeIn>
        )}

        {/* ─── Product Grid ─── */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:gap-x-6 lg:gap-y-12">
            {displayProducts.slice(0, 8).map((product, i) => (
              <SlideUp key={product.id} stagger={80} index={i}>
                <ProductCard product={product} />
              </SlideUp>
            ))}
          </div>
        ) : (
          // ─── Empty state (waist filter yields no matches) ──
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-white border border-[#e5e7eb] rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-[#c9a96e]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#1a1a1a] mb-1">
              No products in waist size {activeWaist}&quot;
            </p>
            <button
              onClick={() => setActiveWaist(null)}
              className="text-xs text-[#c9a96e] hover:text-[#b8955a] underline mt-1"
            >
              Show all sizes
            </button>
          </div>
        )}

        {/* ─── View All ─── */}
        {displayProducts.length > 0 && (
          <FadeIn delay={500}>
            <div className="text-center mt-10 lg:mt-14">
              <Link
                href={viewAllHref}
                className="group inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#c9a96e] transition-all duration-300"
              >
                View All {activeTab === "new" ? "New Arrivals" : "Best Sellers"}
                {activeWaist !== null && (
                  <span className="text-[#c9a96e] group-hover:text-white transition-colors">
                    ({activeWaist}&quot;)
                  </span>
                )}
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}