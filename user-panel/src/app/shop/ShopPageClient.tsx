"use client";
import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, Grid2x2, Grid3x3, X } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductFilters, type FilterState } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types";

const DEFAULT_FILTERS: FilterState = {
  collections: [], sizes: [], colors: [],
  priceMin: 0, priceMax: 20000, sortBy: "newest",
};

interface Props {
  products: Product[];
}

export function ShopPageClient({ products }: Props) {
  const searchParams = useSearchParams();
  const filterParam  = searchParams.get("filter");

  const [filters,       setFilters]       = useState<FilterState>(DEFAULT_FILTERS);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [columns,       setColumns]       = useState<2 | 3 | 4>(4);
  const [isLoading,     setIsLoading]     = useState(false);

  useEffect(() => {
    if (filterParam === "new")         setFilters((f) => ({ ...f, sortBy: "newest" }));
    else if (filterParam === "sale")   setFilters((f) => ({ ...f, sortBy: "price-asc" }));
    else if (filterParam === "bestsellers") setFilters((f) => ({ ...f, sortBy: "bestselling" }));
  }, [filterParam]);

  const handleFilterChange = (newFilters: FilterState) => {
    setIsLoading(true);
    setFilters(newFilters);
    setTimeout(() => setIsLoading(false), 300);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.collections.length > 0) {
      result = result.filter((p) => filters.collections.includes(p.collection));
    }
    if (filters.sizes.length > 0) {
      result = result.filter((p) => p.variants.some((v) => filters.sizes.includes(v.size)));
    }
    if (filters.colors.length > 0) {
      result = result.filter((p) => p.variants.some((v) => filters.colors.includes(v.color)));
    }
    result = result.filter((p) => p.price >= filters.priceMin && p.price <= filters.priceMax);

    if (filterParam === "new")         result = result.filter((p) => p.isNew);
    if (filterParam === "bestsellers") result = result.filter((p) => p.isBestSeller);
    if (filterParam === "sale")        result = result.filter((p) => !!p.compareAtPrice);

    switch (filters.sortBy) {
      case "price-asc":   result.sort((a, b) => a.price - b.price); break;
      case "price-desc":  result.sort((a, b) => b.price - a.price); break;
      case "bestselling": result.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case "rating":      result.sort((a, b) => b.rating - a.rating); break;
      default:            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  }, [filters, filterParam, products]);

  const activeCount = filters.collections.length + filters.sizes.length + filters.colors.length +
    (filters.priceMin > 0 || filters.priceMax < 20000 ? 1 : 0);

  const pageTitle = filterParam === "new" ? "New Arrivals" :
                    filterParam === "bestsellers" ? "Best Sellers" :
                    filterParam === "sale" ? "Sale" : "All Products";

  return (
    <>
      <div className="pt-28 pb-8 sm:pt-32 sm:pb-10 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: pageTitle }]} className="mb-4" />
          </FadeIn>
          <TextReveal as="h1">
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a]">{pageTitle}</span>
          </TextReveal>
          <FadeIn delay={100}>
            <p className="text-[#6b7280] text-sm mt-2">{filteredProducts.length} products</p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="flex gap-8 lg:gap-10">
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters filters={filters} onChange={handleFilterChange} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#e5e7eb]">
              <button onClick={() => setMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-medium text-[#1a1a1a] border border-[#e5e7eb] px-4 py-2 hover:border-[#1a1a1a] transition-colors">
                <SlidersHorizontal size={15} /> Filters
                {activeCount > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center bg-[#c9a96e] text-white text-[10px] font-bold rounded-full">{activeCount}</span>
                )}
              </button>

              <div className="hidden sm:flex flex-1 flex-wrap gap-2">
                {filters.collections.map((c) => (
                  <FilterTag key={c} label={c} onRemove={() => handleFilterChange({ ...filters, collections: filters.collections.filter((x) => x !== c) })} />
                ))}
                {filters.sizes.map((s) => (
                  <FilterTag key={s} label={`Size: ${s}`} onRemove={() => handleFilterChange({ ...filters, sizes: filters.sizes.filter((x) => x !== s) })} />
                ))}
                {filters.colors.map((c) => (
                  <FilterTag key={c} label={c} onRemove={() => handleFilterChange({ ...filters, colors: filters.colors.filter((x) => x !== c) })} />
                ))}
              </div>

              <div className="flex items-center gap-1 ml-auto">
                <button onClick={() => setColumns(2)} className={cn("p-1.5 transition-colors", columns === 2 ? "text-[#1a1a1a]" : "text-[#6b7280] hover:text-[#1a1a1a]")} aria-label="2 columns">
                  <Grid2x2 size={18} />
                </button>
                <button onClick={() => setColumns(4)} className={cn("p-1.5 transition-colors", columns === 4 ? "text-[#1a1a1a]" : "text-[#6b7280] hover:text-[#1a1a1a]")} aria-label="4 columns">
                  <Grid3x3 size={18} />
                </button>
              </div>
            </div>

            <ProductGrid products={filteredProducts} isLoading={isLoading} columns={columns} />
          </div>
        </div>
      </div>

      {mobileFilters && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilters(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm shadow-2xl">
            <ProductFilters filters={filters} onChange={handleFilterChange} isMobile onClose={() => setMobileFilters(false)} />
          </div>
        </>
      )}
    </>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-[#f5f0e8] text-[#1a1a1a] px-2.5 py-1">
      {label}
      <button onClick={onRemove} className="text-[#6b7280] hover:text-[#1a1a1a] transition-colors">
        <X size={11} />
      </button>
    </span>
  );
}