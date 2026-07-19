"use client";
import { cn } from "@/lib/utils";

interface ColorOption {
  name: string;
  hex:  string;
}

interface ColorSelectorProps {
  colors:        ColorOption[];
  selectedColor: string;
  onSelect:      (color: string) => void;
}

/**
 * ELO-style color selector: rectangular labeled buttons with color name.
 * Selected has thick black border, others have light gray border.
 */
export function ColorSelector({
  colors,
  selectedColor,
  onSelect,
}: ColorSelectorProps) {
  return (
    <div>
      <div className="mb-3">
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#1a1a1a]">
          Color
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {colors.map((color) => {
          const isSelected = selectedColor === color.name;
          return (
            <button
              key={color.name}
              onClick={() => onSelect(color.name)}
              className={cn(
                "min-w-[90px] px-4 py-2.5 text-[11px] font-bold tracking-[0.12em] uppercase transition-all duration-150 rounded-lg",
                isSelected
                  ? "border-2 border-[#1a1a1a] bg-white text-[#1a1a1a]"
                  : "border border-[#d1d5db] bg-white text-[#1a1a1a] hover:border-[#1a1a1a]"
              )}
              aria-pressed={isSelected}
            >
              {color.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}