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
  const activeColorName = colors.find((c) => c.name === selectedColor)?.name ?? "";

  return (
    <div>
      <div className="mb-3">
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#1a1a1a]">
          Color
        </span>
        {activeColorName && (
          <span className="ml-2 text-xs text-[#6b7280] tracking-wide">
            {activeColorName}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isSelected = selectedColor === color.name;
          return (
            <button
              key={color.name}
              onClick={() => onSelect(color.name)}
              title={color.name}
              className={cn(
                "relative w-8 h-8 border transition-all duration-150",
                isSelected
                  ? "border-[#1a1a1a] p-0.5"
                  : "border-[#d1d5db] hover:border-[#1a1a1a]"
              )}
            >
              <span
                className="block w-full h-full"
                style={{ backgroundColor: color.hex }}
              />
              {isSelected && (
                <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-[#1a1a1a]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}