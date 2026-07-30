"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  collections: string[];
  brands:      string[];
  sizes:       string[];
  colors:      string[];
  priceMin:    number;
  priceMax:    number;
  sortBy:      string;
}

export interface ColorOption {
  name: string;
  hex:  string;
}

interface ProductFiltersProps {
  filters:         FilterState;
  onChange:        (filters: FilterState) => void;
  availableSizes:  string[];
  availableColors: ColorOption[];
  availableBrands: string[];
  catalogMin:      number;
  catalogMax:      number;
  isMobile?:       boolean;
  onClose?:        () => void;
}

const SORT_OPTIONS = [
  { value: "price-asc",   label: "Price: Low to High" },
  { value: "price-desc",  label: "Price: High to Low" },
];

function Accordion({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#e5e7eb] py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
          {title}
        </span>
        {open
          ? <ChevronUp   size={14} className="text-[#6b7280]" />
          : <ChevronDown size={14} className="text-[#6b7280]" />
        }
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function ProductFilters({
  filters, onChange,
  availableSizes, availableColors, availableBrands,
  catalogMin, catalogMax,
  isMobile = false, onClose,
}: ProductFiltersProps) {
  const toggle = <K extends "collections" | "brands" | "sizes" | "colors">(key: K, value: string) => {
    const arr = filters[key] as string[];
    onChange({
      ...filters,
      [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    });
  };

  const clearAll = () => {
    onChange({
      collections: [], brands: [], sizes: [], colors: [],
      priceMin: catalogMin, priceMax: catalogMax, sortBy: "manual",
    });
  };

  const priceFilterActive =
    filters.priceMin > catalogMin || filters.priceMax < catalogMax;

  const activeCount =
    filters.collections.length +
    filters.brands.length +
    filters.sizes.length +
    filters.colors.length +
    (priceFilterActive ? 1 : 0);

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, filters.priceMax);
    onChange({ ...filters, priceMin: newMin });
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, filters.priceMin);
    onChange({ ...filters, priceMax: newMax });
  };

  const range = catalogMax - catalogMin;
  const step  = range < 5000 ? 100 : range < 20000 ? 250 : 500;

  return (
    <div className={cn("bg-white h-full flex flex-col", isMobile && "h-full")}>

      {isMobile && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1a1a1a]">Filters</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-[#F97316] text-white text-[10px] font-bold rounded-full">
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
              <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
                Filters
              </span>
              {activeCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center bg-[#F97316] text-white text-[10px] font-bold rounded-full">
                  {activeCount}
                </span>
              )}
            </div>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="text-[10px] text-[#6b7280] hover:text-[#F97316] transition-colors underline"
              >
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
                      ? "border-[#F97316] bg-[#F97316]"
                      : "border-[#e5e7eb] group-hover:border-[#F97316]"
                  )}
                  onClick={() => onChange({ ...filters, sortBy: opt.value })}
                />
                <span
                  className="text-sm text-[#6b7280] group-hover:text-[#1a1a1a] transition-colors cursor-pointer"
                  onClick={() => onChange({ ...filters, sortBy: opt.value })}
                >
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </Accordion>

        {/* ── Brand Filter ── */}
        {availableBrands.length >= 2 && (
          <Accordion title="Brand">
            <div className="flex flex-col gap-2">
              {availableBrands.map((brand) => (
                <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    className={cn(
                      "w-4 h-4 border-2 transition-all duration-150 flex-shrink-0 flex items-center justify-center",
                      filters.brands.includes(brand)
                        ? "border-[#F97316] bg-[#F97316]"
                        : "border-[#e5e7eb] group-hover:border-[#F97316]"
                    )}
                    onClick={() => toggle("brands", brand)}
                  >
                    {filters.brands.includes(brand) && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm text-[#6b7280] group-hover:text-[#1a1a1a] transition-colors cursor-pointer"
                    onClick={() => toggle("brands", brand)}
                  >
                    {brand}
                  </span>
                </label>
              ))}
            </div>
          </Accordion>
        )}

        {availableColors.length > 0 && (
          <Accordion title="Color">
            <div className="flex flex-wrap gap-2.5">
              {availableColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => toggle("colors", color.name)}
                  title={color.name}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-all duration-150",
                    filters.colors.includes(color.name)
                      ? "border-[#F97316] scale-110"
                      : "border-[#e5e7eb] hover:border-[#F97316]"
                  )}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </Accordion>
        )}

        {catalogMax > catalogMin && (
          <Accordion title="Price Range">
            <div className="px-1 pb-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#1a1a1a]">
                  PKR {filters.priceMin.toLocaleString()}
                </span>
                <span className="text-xs text-[#6b7280]">to</span>
                <span className="text-xs font-semibold text-[#1a1a1a]">
                  PKR {filters.priceMax.toLocaleString()}
                </span>
              </div>

              <DualRangeSlider
                min={catalogMin}
                max={catalogMax}
                step={step}
                valueMin={filters.priceMin}
                valueMax={filters.priceMax}
                onMinChange={handleMinChange}
                onMaxChange={handleMaxChange}
              />

              <div className="flex items-center justify-between mt-2 text-[10px] text-[#6b7280]">
                <span>Min: PKR {catalogMin.toLocaleString()}</span>
                <span>Max: PKR {catalogMax.toLocaleString()}</span>
              </div>

              {priceFilterActive && (
                <button
                  onClick={() => onChange({ ...filters, priceMin: catalogMin, priceMax: catalogMax })}
                  className="mt-3 text-[10px] text-[#F97316] hover:text-[#C2410C] underline"
                >
                  Reset price range
                </button>
              )}
            </div>
          </Accordion>
        )}

      </div>

      {isMobile && (
        <div className="px-5 py-4 border-t border-[#e5e7eb] flex gap-3">
          <button
            onClick={clearAll}
            className="flex-1 py-3 text-sm font-medium border border-[#e5e7eb] text-[#6b7280] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold bg-[#1a1a1a] text-white hover:bg-[#F97316] transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}

    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  DUAL RANGE SLIDER
// ══════════════════════════════════════════════════════════
interface DualRangeSliderProps {
  min:         number;
  max:         number;
  step:        number;
  valueMin:    number;
  valueMax:    number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}

function DualRangeSlider({
  min, max, step, valueMin, valueMax, onMinChange, onMaxChange,
}: DualRangeSliderProps) {
  if (max <= min) {
    return (
      <div className="w-full h-1.5 bg-[#e5e7eb] relative rounded-full">
        <div className="absolute inset-0 bg-[#F97316] rounded-full" />
      </div>
    );
  }

  const percent = (v: number) => ((v - min) / (max - min)) * 100;
  const leftPct  = percent(valueMin);
  const rightPct = percent(valueMax);

  return (
    <div className="relative h-6 flex items-center">
      <div className="absolute left-0 right-0 h-1 bg-[#e5e7eb] rounded-full pointer-events-none" />
      <div
        className="absolute h-1 bg-[#F97316] rounded-full pointer-events-none"
        style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
      />
      <input
        type="range"
        min={min} max={max} step={step}
        value={valueMin}
        onChange={(e) => onMinChange(Number(e.target.value))}
        className="dual-range absolute inset-0 w-full appearance-none bg-transparent pointer-events-none"
        style={{ zIndex: valueMin > max - (max - min) * 0.1 ? 5 : 3 }}
      />
      <input
        type="range"
        min={min} max={max} step={step}
        value={valueMax}
        onChange={(e) => onMaxChange(Number(e.target.value))}
        className="dual-range absolute inset-0 w-full appearance-none bg-transparent pointer-events-none"
        style={{ zIndex: 4 }}
      />
      <style jsx>{`
        .dual-range {
          -webkit-appearance: none;
          appearance: none;
          height: 24px;
          background: transparent;
        }
        .dual-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid #F97316;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          cursor: grab;
          transition: transform 0.15s;
        }
        .dual-range::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .dual-range::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.2);
        }
        .dual-range::-moz-range-thumb {
          pointer-events: auto;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid #F97316;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          cursor: grab;
          transition: transform 0.15s;
        }
        .dual-range::-moz-range-thumb:hover {
          transform: scale(1.15);
        }
        .dual-range::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
