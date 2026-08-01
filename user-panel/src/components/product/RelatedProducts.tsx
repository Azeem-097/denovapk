"use client";
import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { SlideUp }     from "@/components/animations/SlideUp";
import { FadeIn }      from "@/components/animations/FadeIn";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface RelatedProductsProps {
  products:        Product[];
  currentProductId: string;
}

const RECENTLY_VIEWED_KEY = "denova_recently_viewed_v1";
const MAX_RECENT = 8;

function loadRecentlyViewed(currentId: string): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Product[];
    return parsed.filter((p) => p.id !== currentId).slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function RelatedProducts({
  products,
  currentProductId,
}: RelatedProductsProps) {
  const [tab, setTab] = useState<"related" | "recent">("related");
  const [recent, setRecent] = useState<Product[]>([]);

  useEffect(() => {
    setRecent(loadRecentlyViewed(currentProductId));
  }, [currentProductId]);

  const related = products
    .filter((p) => p.id !== currentProductId)
    .sort((a, b) => Number(a.isSoldOut) - Number(b.isSoldOut))
    .slice(0, 4);

  const hasRelated = related.length > 0;
  const hasRecent  = recent.length > 0;

  if (!hasRelated && !hasRecent) return null;

  const active   = tab === "recent"
    ? recent.slice().sort((a, b) => Number(a.isSoldOut) - Number(b.isSoldOut)).slice(0, 4)
    : related;

  return (
    <section className="py-14 sm:py-16 border-t border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Tabs */}
        <FadeIn>
          <div className="flex items-center justify-center gap-8 sm:gap-10 mb-8 sm:mb-10 border-b border-[#e5e7eb]">
            {hasRelated && (
              <button
                onClick={() => setTab("related")}
                className={cn(
                  "pb-3 text-sm sm:text-base font-bold tracking-[0.15em] uppercase transition-colors relative -mb-px",
                  tab === "related"
                    ? "text-[#1a1a1a] border-b-2 border-[#1a1a1a]"
                    : "text-[#9ca3af] hover:text-[#1a1a1a]"
                )}
              >
                You May Also Like
              </button>
            )}
            {hasRecent && (
              <button
                onClick={() => setTab("recent")}
                className={cn(
                  "pb-3 text-sm sm:text-base font-bold tracking-[0.15em] uppercase transition-colors relative -mb-px",
                  tab === "recent"
                    ? "text-[#1a1a1a] border-b-2 border-[#1a1a1a]"
                    : "text-[#9ca3af] hover:text-[#1a1a1a]"
                )}
              >
                Recently Viewed
              </button>
            )}
          </div>
        </FadeIn>

        {active.length === 0 ? (
          <p className="text-center text-sm text-[#6b7280] py-10">
            {tab === "recent" ? "No recently viewed items yet." : "No related items found."}
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:gap-x-6 lg:gap-y-12">
            {active.map((product, i) => (
              <SlideUp key={product.id} stagger={80} index={i}>
                <ProductCard product={product} />
              </SlideUp>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
