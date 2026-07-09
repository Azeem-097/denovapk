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

export function ColorSelector({
  colors,
  selectedColor,
  onSelect,
}: ColorSelectorProps) {
  return (
    <div>
      <div className="mb-3">
        <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
          Color
          {selectedColor && (
            <span className="ml-2 font-normal text-[#6b7280] normal-case tracking-normal">
              — {selectedColor}
            </span>
          )}
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <button
            key={color.name}
            onClick={() => onSelect(color.name)}
            title={color.name}
            className={cn(
              "relative w-8 h-8 rounded-full border-2 transition-all duration-150",
              selectedColor === color.name
                ? "border-[#c9a96e] scale-110"
                : "border-[#e5e7eb] hover:border-[#c9a96e] hover:scale-105"
            )}
            style={{ backgroundColor: color.hex }}
          >
            {selectedColor === color.name && (
              <span className="absolute inset-0 rounded-full ring-2 ring-[#c9a96e] ring-offset-1" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}