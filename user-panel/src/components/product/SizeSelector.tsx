"use client";
import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes:         string[];
  selectedSize:  string;
  onSelect:      (size: string) => void;
  outOfStock?:   string[];
  label?:        string;  // "Waist" / "Size" / etc.
}

/**
 * ELO-style size selector: rectangular labeled buttons.
 */
export function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
  outOfStock = [],
  label = "Waist",
}: SizeSelectorProps) {
  if (sizes.length === 0) return null;

  return (
    <div>
      <div className="mb-3">
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#1a1a1a]">
          {label}
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {sizes.map((size) => {
          const oos = outOfStock.includes(size);
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              onClick={() => !oos && onSelect(size)}
              disabled={oos}
              className={cn(
                "min-w-[60px] px-4 py-2.5 text-[11px] font-bold tracking-[0.12em] uppercase transition-all duration-150 rounded-lg",
                oos
                  ? "border border-[#e5e7eb] bg-[#fafaf9] text-[#d1d5db] cursor-not-allowed line-through"
                  : isSelected
                  ? "border-2 border-[#1a1a1a] bg-white text-[#1a1a1a]"
                  : "border border-[#d1d5db] bg-white text-[#1a1a1a] hover:border-[#1a1a1a]"
              )}
              aria-pressed={isSelected}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}