"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useToastStore } from "@/store/toastStore";
import { ProductBgWrapper } from "./ProductBgWrapper";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const PLACEHOLDER_URL = "/uploads/placeholder.svg";

function formatPKR(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString("en-PK")}`;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted]     = useState(false);

  const addToCart      = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist   = useWishlistStore((s) => s.isInWishlist(product.id));
  const showToast      = useToastStore((s) => s.addToast);

  useEffect(() => setMounted(true), []);

  const sortedImages = [...(product.images ?? [])].sort(
    (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)
  );
  const primaryImage = sortedImages[0] ?? {
    id: "placeholder", url: PLACEHOLDER_URL, alt: product.name, isPrimary: true,
  };
  const secondaryImage = sortedImages[1];
  const hasSecondary   = Boolean(secondaryImage);

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  const uniqueColors = Array.from(
    new Map(product.variants.map((v) => [v.colorHex, { hex: v.colorHex, name: v.color }])).values()
  );

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVariant = product.variants[0];
    if (!defaultVariant) return;

    addToCart({
      productId: product.id, variantId: defaultVariant.id,
      name: product.name, image: primaryImage.url,
      size: defaultVariant.size, color: defaultVariant.color,
      colorHex: defaultVariant.colorHex, price: product.price,
      quantity: 1, slug: product.slug,
      bgColor: product.bgColor,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id, productId: product.id,
      name: product.name, image: primaryImage.url,
      price: product.price, slug: product.slug,
      bgColor: product.bgColor,
    });
    showToast({
      type: "success",
      message: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
    });
  };

  return (
    <div
      className={cn("group relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block mb-3 sm:mb-4"
      >
        <ProductBgWrapper
          bgColor={product.bgColor}
          className={cn(
            "aspect-[4/5] rounded-xl sm:rounded-2xl",
            !product.bgColor && "bg-[#f4f2ee]"
          )}
        >
          {/* Primary image — subtle zoom on hover */}
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            className={cn(
              "object-cover transition-all duration-[900ms] ease-out",
              hasSecondary && isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100",
              !hasSecondary && isHovered && "scale-105"
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            unoptimized={primaryImage.url === PLACEHOLDER_URL}
          />

          {/* Secondary image */}
          {hasSecondary && (
            <Image
              src={secondaryImage.url}
              alt={secondaryImage.alt || product.name}
              fill
              className={cn(
                "object-cover transition-all duration-[900ms] ease-out",
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
          )}
        </ProductBgWrapper>

        {/* Corner accents that reveal on hover — nudged inward to sit inside the rounded corner */}
        <div
          className={cn(
            "absolute top-3 left-3 w-4 h-4 border-t border-l border-[#c9a96e] transition-all duration-500 pointer-events-none",
            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}
        />
        <div
          className={cn(
            "absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#c9a96e] transition-all duration-500 delay-100 pointer-events-none",
            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}
        />

        {/* Wishlist — rounded to match card aesthetic */}
        <button
          onClick={handleWishlist}
          aria-label={mounted && isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-sm transition-all duration-300 active:scale-90",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none",
            mounted && isInWishlist && "opacity-100 translate-x-0"
          )}
        >
          <Heart
            size={14}
            className={cn(
              "transition-all duration-300",
              mounted && isInWishlist ? "text-[#c9a96e] fill-[#c9a96e] scale-110" : "text-[#1a1a1a]"
            )}
          />
        </button>

        {/* Quick Add bar — rounded bottom corners match container */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 z-10 transition-all duration-400 ease-out overflow-hidden rounded-b-xl sm:rounded-b-2xl",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
          )}
        >
          <button
            onClick={handleQuickAdd}
            className="shimmer-btn w-full bg-white/98 backdrop-blur-sm text-[#1a1a1a] text-[11px] font-semibold tracking-[0.15em] uppercase py-3 hover:bg-[#1a1a1a] hover:text-white transition-colors flex items-center justify-between px-4 border-t border-[#e5e7eb]/50"
          >
            <span>Add to Basket</span>
            <ShoppingBag size={13} strokeWidth={1.75} className="transition-transform duration-300 group-hover:rotate-12" />
          </button>
        </div>
      </Link>

      <div className="px-0.5 space-y-1.5">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#c9a96e]">
          {product.collection || "Denova"}
        </p>

        <Link href={`/products/${product.slug}`}>
          <h3 className="text-xs sm:text-[13px] font-medium tracking-[0.08em] uppercase text-[#1a1a1a] hover:text-[#c9a96e] transition-colors duration-300 leading-snug line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-[13px] sm:text-sm font-bold text-[#1a1a1a] tracking-wide">
            {formatPKR(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-[#9ca3af] line-through">
              {formatPKR(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {uniqueColors.length > 0 && (
          <div className="flex items-center gap-1 pt-1">
            {uniqueColors.slice(0, 6).map((color, i) => (
              <span
                key={color.hex}
                className="w-2.5 h-2.5 border border-[#d1d5db] rounded-full transition-transform duration-300 hover:scale-125"
                style={{
                  backgroundColor: color.hex,
                  transitionDelay: `${i * 30}ms`,
                }}
                title={color.name}
              />
            ))}
            {uniqueColors.length > 6 && (
              <span className="text-[9px] text-[#6b7280] ml-1">+{uniqueColors.length - 6}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}