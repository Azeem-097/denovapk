"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { useSearchStore } from "@/store/searchStore";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

const TRENDING = ["Kurta", "Formal Shirt", "Lawn Suit", "Blazer", "Cashmere"];

export function SearchModal() {
  const { isOpen, closeSearch, recentSearches, addRecent, clearRecent } = useSearchStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  // Lock scroll + focus input
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeSearch(); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, closeSearch]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.collection.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addRecent(query.trim());
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      closeSearch();
    }
  };

  const handleQuickSearch = (q: string) => {
    setQuery(q);
    addRecent(q);
    router.push(`/search?q=${encodeURIComponent(q)}`);
    closeSearch();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeSearch}
      />

      <div className="fixed inset-x-0 top-0 z-[80] bg-white shadow-2xl animate-in slide-in-from-top duration-300 max-h-[90vh] overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <form onSubmit={handleSubmit} className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, collections, or styles..."
                className="w-full pl-12 pr-4 py-4 text-base text-[#1a1a1a] border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none placeholder:text-[#6b7280]/60"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#1a1a1a]"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            <button
              onClick={closeSearch}
              className="p-2 text-[#6b7280] hover:text-[#1a1a1a] transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>

          {/* Content */}
          {query.trim() ? (
            <SearchResults results={results} query={query} onSelect={closeSearch} />
          ) : (
            <div className="space-y-6">

              {/* Recent */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-[#E10600]" />
                      <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
                        Recent Searches
                      </span>
                    </div>
                    <button
                      onClick={clearRecent}
                      className="text-[10px] text-[#6b7280] hover:text-red-500 underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleQuickSearch(s)}
                        className="text-sm text-[#1a1a1a] bg-[#fafaf9] border border-[#e5e7eb] hover:border-[#E10600] px-3 py-1.5 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={13} className="text-[#E10600]" />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
                    Trending Searches
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleQuickSearch(s)}
                      className="text-sm text-white bg-[#1a1a1a] hover:bg-[#E10600] px-3 py-1.5 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured products */}
              <div>
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] block mb-3">
                  Popular Right Now
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {products.filter((p) => p.isBestSeller).slice(0, 4).map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      onClick={closeSearch}
                      className="group"
                    >
                      <div className="relative aspect-[3/4] bg-[#fafaf9] mb-2 overflow-hidden">
                        <Image
                          src={p.images[0].url}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="200px"
                        />
                      </div>
                      <p className="text-xs font-medium text-[#1a1a1a] group-hover:text-[#E10600] transition-colors line-clamp-1">
                        {p.name}
                      </p>
                      <p className="text-xs font-bold text-[#1a1a1a] mt-0.5">{formatPrice(p.price)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SearchResults({
  results, query, onSelect,
}: {
  results: typeof products;
  query: string;
  onSelect: () => void;
}) {
  if (results.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-[#6b7280]">
          No products found for &ldquo;<span className="text-[#1a1a1a] font-semibold">{query}</span>&rdquo;
        </p>
        <p className="text-xs text-[#6b7280] mt-2">Try different keywords or browse our collections.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-[#6b7280] mb-4">
        {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;
        <span className="text-[#1a1a1a] font-semibold">{query}</span>&rdquo;
      </p>

      <div className="space-y-2">
        {results.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            onClick={onSelect}
            className="group flex items-center gap-4 p-3 hover:bg-[#fafaf9] transition-colors border border-transparent hover:border-[#e5e7eb]"
          >
            <div className="relative w-14 h-16 flex-shrink-0 bg-[#fafaf9]">
              <Image
                src={p.images[0].url}
                alt={p.name}
                fill
                className="object-cover"
                sizes="60px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-[#E10600]">{p.collection}</p>
              <p className="text-sm font-medium text-[#1a1a1a] group-hover:text-[#E10600] transition-colors line-clamp-1">
                {p.name}
              </p>
              <p className="text-sm font-bold text-[#1a1a1a] mt-0.5">{formatPrice(p.price)}</p>
            </div>
            <ArrowRight size={14} className="text-[#6b7280] group-hover:text-[#E10600] flex-shrink-0" />
          </Link>
        ))}
      </div>

      <Link
        href={`/search?q=${encodeURIComponent(query)}`}
        onClick={onSelect}
        className="mt-6 block text-center bg-[#1a1a1a] text-white py-3 text-sm font-semibold tracking-wide hover:bg-[#E10600] transition-colors"
      >
        View all results
      </Link>
    </div>
  );
}