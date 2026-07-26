"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { SlidersHorizontal, Grid2x2, Grid3x3, X } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductFilters, type FilterState, type ColorOption } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types";

interface Props {
  products: Product[];
}

function getProductWaists(product: Product): string[] {
  const values = new Set<string>();

  for (const row of product.measurements ?? []) {
    if (row.waist !== null && row.waist !== undefined && !Number.isNaN(row.waist)) {
      values.add(String(row.waist));
    }
  }

  if (product.waist !== null && product.waist !== undefined && !Number.isNaN(product.waist)) {
    values.add(String(product.waist));
  }

  return Array.from(values);
}

export function ShopPageClient({ products }: Props) {
  const productResultsRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const filterParam  = searchParams.get("filter");
  const waistParam   = searchParams.get("waist");

  const { catalogMin, catalogMax } = useMemo(() => {
    if (products.length === 0) return { catalogMin: 0, catalogMax: 0 };
    let min = Infinity;
    let max = 0;
    for (const p of products) {
      if (p.price < min) min = p.price;
      if (p.price > max) max = p.price;
    }
    return {
      catalogMin: Math.max(0, Math.floor(min / 100) * 100),
      catalogMax: Math.ceil(max / 100) * 100,
    };
  }, [products]);

  const DEFAULT_FILTERS: FilterState = useMemo(() => ({
    collections: [], brands: [], sizes: [], colors: [],
    priceMin: catalogMin, priceMax: catalogMax, sortBy: "manual",
  }), [catalogMin, catalogMax]);

  const [filters,       setFilters]       = useState<FilterState>(DEFAULT_FILTERS);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [columns,       setColumns]       = useState<2 | 3 | 4>(4);
  const [isLoading,     setIsLoading]     = useState(false);

  useEffect(() => {
    setFilters((prev) => {
      const untouched = prev.priceMin === 0 || prev.priceMax === 20000 ||
                        prev.priceMin === catalogMin || prev.priceMax === catalogMax;
      if (untouched) {
        return { ...prev, priceMin: catalogMin, priceMax: catalogMax };
      }
      return {
        ...prev,
        priceMin: Math.max(catalogMin, Math.min(prev.priceMin, catalogMax)),
        priceMax: Math.min(catalogMax, Math.max(prev.priceMax, catalogMin)),
      };
    });
  }, [catalogMin, catalogMax]);

  useEffect(() => {
    if (filterParam === "new")              setFilters((f) => ({ ...f, sortBy: "newest" }));
    else if (filterParam === "sale")        setFilters((f) => ({ ...f, sortBy: "price-asc" }));
    else if (filterParam === "bestsellers") setFilters((f) => ({ ...f, sortBy: "bestselling" }));
  }, [filterParam]);

  useEffect(() => {
    if (!waistParam) return;
    const parsed = waistParam.split(",").map((s) => s.trim()).filter(Boolean);
    if (parsed.length === 0) return;
    setFilters((prev) => {
      const merged = Array.from(new Set([...prev.sizes, ...parsed]));
      return { ...prev, sizes: merged };
    });
  }, [waistParam]);

  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      getProductWaists(p).forEach((waist) => set.add(waist));
    });
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [products]);

  const availableColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.color && !map.has(v.color)) map.set(v.color, v.colorHex || "#000000");
      });
    });
    return Array.from(map.entries())
      .map(([name, hex]): ColorOption => ({ name, hex }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const brand = p.brand?.trim();
      if (brand && brand.length > 0) set.add(brand);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const handleFilterChange = (newFilters: FilterState) => {
    setIsLoading(true);
    setFilters(newFilters);
    setTimeout(() => setIsLoading(false), 300);
    window.requestAnimationFrame(() => {
      productResultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.collections.length > 0) {
      result = result.filter((p) => filters.collections.includes(p.collection));
    }

    if (filters.brands.length > 0) {
      result = result.filter((p) => {
        const brand = p.brand?.trim();
        return brand && filters.brands.includes(brand);
      });
    }

    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        getProductWaists(p).some((waist) => filters.sizes.includes(waist))
      );
    }

    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        p.variants.some((v) => filters.colors.includes(v.color))
      );
    }

    result = result.filter((p) =>
      p.price >= filters.priceMin && p.price <= filters.priceMax
    );

    if (filterParam === "new")         result = result.filter((p) => p.isNew);
    if (filterParam === "bestsellers") result = result.filter((p) => p.isBestSeller);
    if (filterParam === "sale")        result = result.filter((p) => !!p.compareAtPrice);

    switch (filters.sortBy) {
      case "price-asc":   result.sort((a, b) => a.price - b.price); break;
      case "price-desc":  result.sort((a, b) => b.price - a.price); break;
      case "bestselling": result.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case "rating":      result.sort((a, b) => b.rating - a.rating); break;
      case "newest":      result.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ); break;
      default:            break;
    }
    return result;
  }, [filters, filterParam, products]);

  const priceFilterActive =
    filters.priceMin > catalogMin || filters.priceMax < catalogMax;

  const activeCount =
    filters.collections.length +
    filters.brands.length +
    filters.sizes.length +
    filters.colors.length +
    (priceFilterActive ? 1 : 0);

  const pageTitle = filterParam === "new"         ? "New Arrivals" :
                    filterParam === "bestsellers" ? "Best Sellers" :
                    filterParam === "sale"        ? "Sale" :
                    "International Branded Jeans";

  return (
    <>
      <div className="pt-6 pb-4 sm:pt-8 sm:pb-5 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="site-container">
          <FadeIn>
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: pageTitle }]} className="mb-2" />
          </FadeIn>
          <TextReveal as="h1">
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a]">
              {pageTitle}
            </span>
          </TextReveal>
          <FadeIn delay={100}>
            <p className="text-[#6b7280] text-sm mt-1">{filteredProducts.length} products</p>
          </FadeIn>
        </div>
      </div>

      <div className="site-container py-8 lg:py-10">
        <div className="flex gap-8 lg:gap-10">
          <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters
                filters={filters}
                onChange={handleFilterChange}
                availableSizes={availableSizes}
                availableColors={availableColors}
                availableBrands={availableBrands}
                catalogMin={catalogMin}
                catalogMax={catalogMax}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0" ref={productResultsRef}>
            <div className="md:hidden flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#e5e7eb]">
              <button
                onClick={() => setMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-medium text-[#1a1a1a] border border-[#e5e7eb] px-4 py-2 hover:border-[#1a1a1a] transition-colors"
              >
                <SlidersHorizontal size={15} /> Filters
                {activeCount > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center bg-[#E10600] text-white text-[10px] font-bold rounded-full">
                    {activeCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => setColumns(2)}
                  className={cn("p-1.5 transition-colors", columns === 2 ? "text-[#1a1a1a]" : "text-[#6b7280] hover:text-[#1a1a1a]")}
                  aria-label="2 columns"
                >
                  <Grid2x2 size={18} />
                </button>
                <button
                  onClick={() => setColumns(4)}
                  className={cn("p-1.5 transition-colors", columns === 4 ? "text-[#1a1a1a]" : "text-[#6b7280] hover:text-[#1a1a1a]")}
                  aria-label="4 columns"
                >
                  <Grid3x3 size={18} />
                </button>
              </div>
            </div>

            {availableSizes.length > 0 && (
              <div className="mb-6 pb-4 border-b border-[#e5e7eb]">
                <div className="text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
                  Filter by Waist
                </div>
                <div className="mt-3 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => {
                      const isActive = filters.sizes.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() =>
                            handleFilterChange({
                              ...filters,
                              sizes: isActive
                                ? filters.sizes.filter((s) => s !== size)
                                : [...filters.sizes, size],
                            })
                          }
                          className={cn(
                            "min-w-[44px] h-10 px-3.5 text-sm font-semibold border transition-all duration-150",
                            isActive
                              ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                              : "border-[#e5e7eb] text-[#1a1a1a] bg-white hover:border-[#1a1a1a]"
                          )}
                          aria-pressed={isActive}
                          aria-label={`Filter by waist ${size} inches`}
                        >
                          {size}
                        </button>
                      );
                    })}
                    {filters.sizes.length > 0 && (
                      <button
                        onClick={() => handleFilterChange({ ...filters, sizes: [] })}
                        className="text-xs text-[#6b7280] hover:text-[#E10600] underline transition-colors ml-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="hidden md:block flex-1 h-px bg-[#e5e7eb]" />
                  <div className="hidden md:flex items-center gap-1">
                    <button
                      onClick={() => setColumns(2)}
                      className={cn("p-1.5 transition-colors", columns === 2 ? "text-[#1a1a1a]" : "text-[#6b7280] hover:text-[#1a1a1a]")}
                      aria-label="2 columns"
                    >
                      <Grid2x2 size={18} />
                    </button>
                    <button
                      onClick={() => setColumns(4)}
                      className={cn("p-1.5 transition-colors", columns === 4 ? "text-[#1a1a1a]" : "text-[#6b7280] hover:text-[#1a1a1a]")}
                      aria-label="4 columns"
                    >
                      <Grid3x3 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <ProductGrid products={filteredProducts} isLoading={isLoading} columns={columns} />
          </div>
        </div>
      </div>

      {mobileFilters && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFilters(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm shadow-2xl">
            <ProductFilters
              filters={filters}
              onChange={handleFilterChange}
              availableSizes={availableSizes}
              availableColors={availableColors}
              availableBrands={availableBrands}
              catalogMin={catalogMin}
              catalogMax={catalogMax}
              isMobile
              onClose={() => setMobileFilters(false)}
            />
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
