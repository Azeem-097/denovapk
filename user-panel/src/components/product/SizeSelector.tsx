"use client";
import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes:         string[];
  selectedSize:  string;
  onSelect:      (size: string) => void;
  outOfStock?:   string[];
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
  outOfStock = [],
}: SizeSelectorProps) {
  if (sizes.length === 0) return null;

  return (
    <div>
      <div className="mb-4">
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#1a1a1a]">
          Select Size
        </span>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {sizes.map((size) => {
          const oos = outOfStock.includes(size);
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              onClick={() => !oos && onSelect(size)}
              disabled={oos}
              className={cn(
                "text-sm font-medium tracking-wide transition-all duration-150 relative",
                oos
                  ? "text-[#d1d5db] cursor-not-allowed line-through"
                  : isSelected
                  ? "text-[#1a1a1a] font-bold"
                  : "text-[#6b7280] hover:text-[#1a1a1a]"
              )}
            >
              {size}
              {isSelected && !oos && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#1a1a1a]" />
              )}
            </button>
          );
        })}
      </div>

      {selectedSize && (
        <p className="mt-3 text-[11px] text-[#6b7280] tracking-wide">
          Selected: <span className="text-[#1a1a1a] font-semibold">{selectedSize}</span>
        </p>
      )}
    </div>
  );
}