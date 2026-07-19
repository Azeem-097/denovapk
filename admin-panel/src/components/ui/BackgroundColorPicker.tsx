"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Preset swatches for product image backgrounds.
 * The first option (null) means "keep original image — no background swap".
 */
const PRESETS: Array<{ label: string; value: string | null }> = [
  { label: "Original",   value: null       },
  { label: "Cream",      value: "#f5f0e8"  },
  { label: "Beige",      value: "#e8dccc"  },
  { label: "Soft Gray",  value: "#eeeeee"  },
  { label: "Warm White", value: "#faf7f2"  },
  { label: "Charcoal",   value: "#2b2b2b"  },
];

interface Props {
  value:    string | null;
  onChange: (val: string | null) => void;
  /** Optional preview image URL — shows the effect in real time */
  previewImage?: string;
}

export function BackgroundColorPicker({ value, onChange, previewImage }: Props) {
  const isPreset = PRESETS.some((p) => p.value === value);
  const [mode, setMode] = useState<"preset" | "custom">(isPreset ? "preset" : "custom");
  const [customHex, setCustomHex] = useState(value ?? "#f5f0e8");

  // Keep custom hex in sync if parent value changes and it's a custom color
  useEffect(() => {
    if (value && !PRESETS.some((p) => p.value === value)) {
      setCustomHex(value);
      setMode("custom");
    } else if (isPreset) {
      setMode("preset");
    }
  }, [value, isPreset]);

  const handlePresetClick = (v: string | null) => {
    setMode("preset");
    onChange(v);
  };

  const handleCustomToggle = () => {
    setMode("custom");
    onChange(customHex);
  };

  const handleCustomChange = (hex: string) => {
    setCustomHex(hex);
    onChange(hex);
  };

  return (
    <div className="space-y-4">
      {/* Preset swatches */}
      <div>
        <p className="text-[10px] font-medium text-[#6b7280] uppercase tracking-wide mb-2">
          Preset backgrounds
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRESETS.map((preset) => {
            const isSelected = mode === "preset" && value === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset.value)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1.5 p-2 border transition-all",
                  isSelected
                    ? "border-[#3b5f8f] ring-1 ring-[#3b5f8f]"
                    : "border-[#e5e7eb] hover:border-[#9ca3af]"
                )}
              >
                <div
                  className={cn(
                    "w-full h-8 border border-[#e5e7eb]",
                    preset.value === null && "bg-[repeating-conic-gradient(#e5e7eb_0%_25%,white_0%_50%)] bg-[length:8px_8px]"
                  )}
                  style={preset.value ? { backgroundColor: preset.value } : undefined}
                />
                <span className="text-[10px] font-medium text-[#1a1a1a] truncate w-full text-center">
                  {preset.label}
                </span>
                {isSelected && (
                  <Check size={12} className="absolute top-1 right-1 text-[#3b5f8f]" />
                )}
              </button>
            );
          })}

          {/* Custom option */}
          <button
            type="button"
            onClick={handleCustomToggle}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1.5 p-2 border transition-all",
              mode === "custom"
                ? "border-[#3b5f8f] ring-1 ring-[#3b5f8f]"
                : "border-[#e5e7eb] hover:border-[#9ca3af]"
            )}
          >
            <div
              className="w-full h-8 border border-[#e5e7eb]"
              style={{
                background: mode === "custom"
                  ? customHex
                  : "linear-gradient(135deg, #ff6b6b 0%, #ffe66d 33%, #4ecdc4 66%, #556270 100%)",
              }}
            />
            <span className="text-[10px] font-medium text-[#1a1a1a]">Custom</span>
            {mode === "custom" && (
              <Check size={12} className="absolute top-1 right-1 text-[#3b5f8f]" />
            )}
          </button>
        </div>
      </div>

      {/* Custom color picker */}
      {mode === "custom" && (
        <div>
          <p className="text-[10px] font-medium text-[#6b7280] uppercase tracking-wide mb-2">
            Custom color
          </p>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customHex}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="w-14 h-9 border border-[#e5e7eb] cursor-pointer"
            />
            <input
              type="text"
              value={customHex}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="#f5f0e8"
              className="flex-1 px-3 py-2 text-xs font-mono border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Live preview */}
      {previewImage && (
        <div>
          <p className="text-[10px] font-medium text-[#6b7280] uppercase tracking-wide mb-2">
            Live preview
          </p>
          <div
            className="relative aspect-[4/5] w-32 border border-[#e5e7eb] overflow-hidden"
            style={value ? { backgroundColor: value } : { backgroundColor: "#f4f2ee" }}
          >
            <Image
              src={previewImage}
              alt="Preview"
              fill
              className="object-cover"
              sizes="128px"
              style={value ? { mixBlendMode: "multiply" } : undefined}
              unoptimized={previewImage.endsWith(".svg")}
            />
          </div>
          <p className="text-[10px] text-[#6b7280] mt-1.5 max-w-xs leading-relaxed">
            {value
              ? "Background is applied via CSS blend-mode. White pixels in the image are replaced with this color."
              : "No background — original image will be shown as-is."}
          </p>
        </div>
      )}
    </div>
  );
}