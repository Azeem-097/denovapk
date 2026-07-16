"use client";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SIZES } from "@/lib/constants";

export interface FilterState {
  collections: string[];
  sizes:       string[];       // stores waist values as strings, e.g. ["30","32"]
  colors:      string[];
  priceMin:    number;
  priceMax:    number;
  sortBy:      string;
}

interface ProductFiltersProps {
  filters:    FilterState;
  onChange:   (filters: FilterState) => void;
  isMobile?:  boolean;
  onClose?:   () => void;
}

const COLORS = [
  { name: "Dark Blue",  hex: "#1e3a5f" },
  { name: "Light Blue", hex: "#7ba8d0" },
  { name: "Black",      hex: "#111111" },
  { name: "Grey",       hex: "#6b7280" },
  { name: "Charcoal",   hex: "#36454f" },
  { name: "White",      hex: "#ffffff" },
  { name: "Beige",      hex: "#f5f0e8" },
  { name: "Khaki",      hex: "#c3b091" },
];

const SORT_OPTIONS = [
  { value: "newest",       label: "Newest First" },
  { value: "price-asc",    label: "Price: Low to High" },
  { value: "price-desc",   label: "Price: High to Low" },
  { value: "bestselling",  label: "Best Selling" },
  { value: "rating",       label: "Top Rated" },
];

function Accordion({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#e5e7eb] py-4">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-left">
        <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">{title}</span>
        {open ? <ChevronUp size={14} className="text-[#6b7280]" /> : <ChevronDown size={14} className="text-[#6b7280]" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function ProductFilters({
  filters, onChange, isMobile = false, onClose,
}: ProductFiltersProps) {
  const [collections, setCollections] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/shop/collections")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && Array.isArray(data.collections)) {
          setCollections(data.collections.map((c: { name: string }) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  const toggle = <K extends "collections" | "sizes" | "colors">(key: K, value: string) => {
    const arr = filters[key] as string[];
    onChange({
      ...filters,
      [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    });
  };

  const clearAll = () => {
    onChange({
      collections: [], sizes: [], colors: [],
      priceMin: 0, priceMax: 20000, sortBy: "newest",
    });
  };

  const activeCount =
    filters.collections.length +
    filters.sizes.length +
    filters.colors.length +
    (filters.priceMin > 0 || filters.priceMax < 20000 ? 1 : 0);

  return (
    <div className={cn("bg-white", isMobile && "h-full flex flex-col")}>

      {isMobile && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1a1a1a]">Filters</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-[#c9a96e] text-white text-[10px] font-bold rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 text-[#6b7280] hover:text-[#1a1a1a]">
            <X size={20} />
          </button>
        </div>
      )}

      <div className={cn("flex-1 overflow-y-auto", isMobile ? "px-5" : "")}>

        {!isMobile && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">Filters</span>
              {activeCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center bg-[#c9a96e] text-white text-[10px] font-bold rounded-full">
                  {activeCount}
                </span>
              )}
            </div>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-[10px] text-[#6b7280] hover:text-[#c9a96e] transition-colors underline">
                Clear all
              </button>
            )}
          </div>
        )}

        <Accordion title="Sort By">
          <div className="flex flex-col gap-2">
            {SORT_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 transition-all duration-150 flex-shrink-0",
                    filters.sortBy === opt.value
                      ? "border-[#c9a96e] bg-[#c9a96e]"
                      : "border-[#e5e7eb] group-hover:border-[#c9a96e]"
                  )}
                  onClick={() => onChange({ ...filters, sortBy: opt.value })}
                />
                <span className="text-sm text-[#6b7280] group-hover:text-[#1a1a1a] transition-colors cursor-pointer"
                  onClick={() => onChange({ ...filters, sortBy: opt.value })}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </Accordion>

        <Accordion title="Collections">
          <div className="flex flex-col gap-2">
            {collections.length === 0 ? (
              <p className="text-xs text-[#6b7280] italic">Loading...</p>
            ) : (
              collections.map((col) => (
                <label key={col} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    className={cn(
                      "w-4 h-4 border-2 transition-all duration-150 flex-shrink-0 flex items-center justify-center",
                      filters.collections.includes(col)
                        ? "border-[#c9a96e] bg-[#c9a96e]"
                        : "border-[#e5e7eb] group-hover:border-[#c9a96e]"
                    )}
                    onClick={() => toggle("collections", col)}
                  >
                    {filters.collections.includes(col) && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-[#6b7280] group-hover:text-[#1a1a1a] transition-colors cursor-pointer"
                    onClick={() => toggle("collections", col)}>
                    {col}
                  </span>
                </label>
              ))
            )}
          </div>
        </Accordion>

        {/* Waist filter — uses `sizes` state key but filters by product.waist */}
        <Accordion title="Waist Size">
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => toggle("sizes", size)}
                className={cn(
                  "w-10 h-10 text-xs font-medium border transition-all duration-150",
                  filters.sizes.includes(size)
                    ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                    : "border-[#e5e7eb] text-[#6b7280] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </Accordion>

        <Accordion title="Color">
          <div className="flex flex-wrap gap-2.5">
            {COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => toggle("colors", color.name)}
                title={color.name}
                className={cn(
                  "w-7 h-7 rounded-full border-2 transition-all duration-150",
                  filters.colors.includes(color.name)
                    ? "border-[#c9a96e] scale-110"
                    : "border-[#e5e7eb] hover:border-[#c9a96e]"
                )}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </Accordion>

        <Accordion title="Price Range">
          <div className="px-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#6b7280]">PKR {filters.priceMin.toLocaleString()}</span>
              <span className="text-xs text-[#6b7280]">PKR {filters.priceMax.toLocaleString()}</span>
            </div>
            <input
              type="range" min={0} max={20000} step={500}
              value={filters.priceMax}
              onChange={(e) => onChange({ ...filters, priceMax: Number(e.target.value) })}
              className="w-full accent-[#c9a96e]"
            />
          </div>
        </Accordion>

      </div>

      {isMobile && (
        <div className="px-5 py-4 border-t border-[#e5e7eb] flex gap-3">
          <button onClick={clearAll}
            className="flex-1 py-3 text-sm font-medium border border-[#e5e7eb] text-[#6b7280] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors">
            Clear All
          </button>
          <button onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold bg-[#1a1a1a] text-white hover:bg-[#c9a96e] transition-colors">
            Apply Filters
          </button>
        </div>
      )}

    </div>
  );
}