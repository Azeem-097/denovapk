"use client";
import { useState } from "react";
import Image from "next/image";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

interface ProductImagesProps {
  images:       ProductImage[];
  productName:  string;
}

const PLACEHOLDER: ProductImage = {
  id:        "placeholder",
  url:       "/uploads/placeholder.svg",
  alt:       "Product image coming soon",
  isPrimary: true,
};

export function ProductImages({ images, productName }: ProductImagesProps) {
  // Defensive: never crash if images is empty
  const safeImages = images && images.length > 0 ? images : [PLACEHOLDER];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = safeImages[activeIndex] ?? PLACEHOLDER;

  const goPrev = () => setActiveIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1));
  const goNext = () => setActiveIndex((i) => (i === safeImages.length - 1 ? 0 : i + 1));

  return (
    <div className="flex gap-3 sm:gap-4">

      {/* Thumbnails column (only if 2+ images) */}
      {safeImages.length > 1 && (
        <div className="hidden sm:flex flex-col gap-2 w-16 lg:w-20 flex-shrink-0">
          {safeImages.map((img, i) => (
            <button
              key={img.id + i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative aspect-[3/4] bg-[#fafaf9] overflow-hidden border-2 transition-colors",
                i === activeIndex ? "border-[#c9a96e]" : "border-transparent hover:border-[#e5e7eb]"
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt || productName}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized={img.url.endsWith(".svg")}
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 aspect-[3/4] bg-[#fafaf9] overflow-hidden group">
        {activeImage.url === PLACEHOLDER.url ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#c9a96e] gap-2">
            <Package size={48} strokeWidth={1.5} />
            <p className="text-xs font-medium tracking-widest uppercase text-[#6b7280]">
              Image coming soon
            </p>
          </div>
        ) : (
          <Image
            src={activeImage.url}
            alt={activeImage.alt || productName}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
            priority
          />
        )}

        {/* Prev / Next buttons (only if 2+ images) */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-white shadow-md text-[#1a1a1a] transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-white shadow-md text-[#1a1a1a] transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>

            {/* Dot indicator (mobile only) */}
            <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {safeImages.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    i === activeIndex ? "bg-[#c9a96e] w-4" : "bg-white/60"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}