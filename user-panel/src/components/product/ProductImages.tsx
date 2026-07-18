"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Package, Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useToastStore } from "@/store/toastStore";
import { ProductBgWrapper } from "./ProductBgWrapper";
import { DiscountBadge } from "./DiscountBadge";
import { cn } from "@/lib/utils";
import type { ProductImage as ProductImageType } from "@/types";

interface ProductImagesProps {
  images:           ProductImageType[];
  productName:      string;
  productId:        string;
  productSlug:      string;
  productPrice:     number;
  bgColor?:         string | null;
  discountPercent?: number;   // if > 0, shows ribbon on first image
}

const PLACEHOLDER: ProductImageType = {
  id:        "placeholder",
  url:       "/uploads/placeholder.svg",
  alt:       "Product image coming soon",
  isPrimary: true,
};

export function ProductImages({
  images,
  productName,
  productId,
  productSlug,
  productPrice,
  bgColor,
  discountPercent,
}: ProductImagesProps) {
  const safeImages = images && images.length > 0 ? images : [PLACEHOLDER];

  const sortedImages = [...safeImages].sort(
    (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)
  );

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== mobileIndex) setMobileIndex(idx);
  }, [mobileIndex]);

  const scrollToSlide = useCallback((idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist   = useWishlistStore((s) => s.isInWishlist(productId));
  const showToast      = useToastStore((s) => s.addToast);

  const primaryImage = sortedImages[0];

  const handleWishlist = () => {
    toggleWishlist({
      id:        productId,
      productId: productId,
      name:      productName,
      image:     primaryImage.url,
      price:     productPrice,
      slug:      productSlug,
      bgColor:   bgColor,
    });
    showToast({
      type: "success",
      message: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
    });
  };

  const hasDiscount = !!discountPercent && discountPercent > 0;

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden sm:grid grid-cols-2 gap-2 lg:gap-3">
        {sortedImages.map((img, i) => (
          <div key={img.id + i} className="relative group">
            <ProductBgWrapper
              bgColor={bgColor}
              className={cn(
                "aspect-[4/5]",
                !bgColor && "bg-[#f4f2ee]"
              )}
            >
              {img.url === PLACEHOLDER.url ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#c9a96e] gap-2">
                  <Package size={48} strokeWidth={1.5} />
                  <p className="text-xs font-medium tracking-widest uppercase text-[#6b7280]">
                    Image coming soon
                  </p>
                </div>
              ) : (
                <Image
                  src={img.url}
                  alt={img.alt || productName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 45vw"
                  priority={i === 0}
                  loading={i === 0 ? "eager" : "lazy"}
                  unoptimized={img.url.endsWith(".svg")}
                />
              )}
            </ProductBgWrapper>

            {/* Discount ribbon — only on primary image */}
            {i === 0 && hasDiscount && (
              <DiscountBadge percent={discountPercent!} />
            )}

            {i === 0 && (
              <button
                onClick={handleWishlist}
                aria-label={mounted && isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                className={cn(
                  "absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/95 backdrop-blur-sm transition-all duration-300",
                  "opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0",
                  mounted && isInWishlist && "opacity-100 translate-x-0"
                )}
              >
                <Heart
                  size={16}
                  className={cn(
                    "transition-colors",
                    mounted && isInWishlist ? "text-[#c9a96e] fill-[#c9a96e]" : "text-[#1a1a1a]"
                  )}
                />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* MOBILE */}
      <div className="sm:hidden">
        <div className="relative">
          <button
            onClick={handleWishlist}
            aria-label={mounted && isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-sm"
          >
            <Heart
              size={16}
              className={cn(
                "transition-colors",
                mounted && isInWishlist ? "text-[#c9a96e] fill-[#c9a96e]" : "text-[#1a1a1a]"
              )}
            />
          </button>

          {/* Mobile discount ribbon */}
          {hasDiscount && (
            <DiscountBadge percent={discountPercent!} />
          )}

          <div
            ref={scrollerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide overscroll-x-contain touch-pan-x"
            style={{ scrollBehavior: "auto" }}
          >
            {sortedImages.map((img, i) => (
              <div
                key={img.id + i}
                className="flex-shrink-0 w-full snap-start"
              >
                <ProductBgWrapper
                  bgColor={bgColor}
                  className={cn(
                    "aspect-[4/5]",
                    !bgColor && "bg-[#f4f2ee]"
                  )}
                >
                  {img.url === PLACEHOLDER.url ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#c9a96e] gap-2">
                      <Package size={48} strokeWidth={1.5} />
                      <p className="text-xs font-medium tracking-widest uppercase text-[#6b7280]">
                        Image coming soon
                      </p>
                    </div>
                  ) : (
                    <Image
                      src={img.url}
                      alt={img.alt || productName}
                      fill
                      className="object-cover pointer-events-none"
                      sizes="100vw"
                      priority={i === 0}
                      draggable={false}
                    />
                  )}
                </ProductBgWrapper>
              </div>
            ))}
          </div>

          {sortedImages.length > 1 && (
            <div className="absolute top-3 left-3 z-10 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold tracking-wide px-2 py-1 rounded-full">
              {mobileIndex + 1} / {sortedImages.length}
            </div>
          )}
        </div>

        {sortedImages.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-4 pb-1">
            {sortedImages.map((_, i) => {
              const isActive = i === mobileIndex;
              return (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    isActive
                      ? "w-6 bg-[#1a1a1a]"
                      : "w-1.5 bg-[#d1d5db] hover:bg-[#9ca3af]"
                  )}
                />
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}