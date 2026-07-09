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
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
          Size
          {selectedSize && (
            <span className="ml-2 font-normal text-[#6b7280] normal-case tracking-normal">
              — {selectedSize}
            </span>
          )}
        </span>
        <button className="text-xs text-[#c9a96e] underline hover:text-[#b8955a] transition-colors">
          Size Guide
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const oos = outOfStock.includes(size);
          return (
            <button
              key={size}
              onClick={() => !oos && onSelect(size)}
              disabled={oos}
              className={cn(
                "relative w-11 h-11 text-xs font-medium border transition-all duration-150",
                oos
                  ? "border-[#e5e7eb] text-[#d1d5db] cursor-not-allowed"
                  : selectedSize === size
                  ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                  : "border-[#e5e7eb] text-[#1a1a1a] hover:border-[#1a1a1a]"
              )}
            >
              {size}
              {oos && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="absolute w-full h-px bg-[#d1d5db] rotate-45 origin-center" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}