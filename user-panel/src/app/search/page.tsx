"use client";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search as SearchIcon, ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { products } from "@/lib/data";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.collection.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <>
      <div className="pt-28 pb-8 sm:pt-32 sm:pb-10 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Search" }]}
              className="mb-4"
            />
          </FadeIn>
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#E10600]">
              Search Results
            </span>
          </FadeIn>
          <TextReveal as="h1" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-2 block">
              {query ? `"${query}"` : "Search"}
            </span>
          </TextReveal>
          {query && (
            <FadeIn delay={200}>
              <p className="text-[#6b7280] text-sm mt-2">
                {results.length} {results.length === 1 ? "product" : "products"} found
              </p>
            </FadeIn>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {!query.trim() ? (
          <div className="text-center py-16">
            <SearchIcon size={40} className="text-[#E10600] mx-auto mb-4" />
            <p className="text-sm text-[#6b7280]">Enter a search term to find products.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <SearchIcon size={40} className="text-[#E10600] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-2">
              No results found
            </h2>
            <p className="text-sm text-[#6b7280] mb-6">
              We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try different keywords or explore our collections.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 text-sm font-semibold hover:bg-[#E10600] transition-colors"
            >
              Browse All Products
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <ProductGrid products={results} columns={4} />
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-sm text-[#6b7280]">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}