"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const PLACEHOLDER_URL = "/uploads/placeholder.svg";

// Editorial price formatter — "PKR 6,990" (no decimals)
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

  // ── Image selection ──────────────────────────────────
  const sortedImages = [...(product.images ?? [])].sort(
    (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)
  );
  const primaryImage = sortedImages[0] ?? {
    id: "placeholder", url: PLACEHOLDER_URL, alt: product.name, isPrimary: true,
  };
  const secondaryImage = sortedImages[1];
  const hasSecondary   = Boolean(secondaryImage);

  // ── Pricing ──────────────────────────────────────────
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  // ── Unique color swatches ────────────────────────────
  const uniqueColors = Array.from(
    new Map(product.variants.map((v) => [v.colorHex, { hex: v.colorHex, name: v.color }])).values()
  );

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVariant = product.variants[0];
    if (!defaultVariant) return;

    addToCart({
      productId: product.id,
      variantId: defaultVariant.id,
      name:      product.name,
      image:     primaryImage.url,
      size:      defaultVariant.size,
      color:     defaultVariant.color,
      colorHex:  defaultVariant.colorHex,
      price:     product.price,
      quantity:  1,
      slug:      product.slug,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id:        product.id,
      productId: product.id,
      name:      product.name,
      image:     primaryImage.url,
      price:     product.price,
      slug:      product.slug,
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
      {/* ═══════════════════════════════════════════════
          IMAGE AREA — tall 4/5, warm off-white bg
          ═══════════════════════════════════════════════ */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-[#f4f2ee] mb-3 sm:mb-4"
      >
        {/* Primary image (no scale — Outfitters style) */}
        <Image
          src={primaryImage.url}
          alt={primaryImage.alt}
          fill
          className={cn(
            "object-cover transition-opacity duration-500 ease-out",
            hasSecondary && isHovered ? "opacity-0" : "opacity-100"
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          unoptimized={primaryImage.url === PLACEHOLDER_URL}
        />

        {/* Secondary image (fade on hover) */}
        {hasSecondary && (
          <Image
            src={secondaryImage.url}
            alt={secondaryImage.alt || product.name}
            fill
            className={cn(
              "object-cover transition-opacity duration-500 ease-out",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />
        )}

        {/* Wishlist — hover reveal, top right */}
        <button
          onClick={handleWishlist}
          aria-label={mounted && isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/95 backdrop-blur-sm transition-all duration-300",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none",
            mounted && isInWishlist && "opacity-100 translate-x-0"
          )}
        >
          <Heart
            size={14}
            className={cn(
              "transition-colors",
              mounted && isInWishlist ? "text-[#c9a96e] fill-[#c9a96e]" : "text-[#1a1a1a]"
            )}
          />
        </button>

        {/* Quick Add bar — slides up from bottom (Outfitters "Add to Basket" style) */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 z-10 transition-all duration-300 ease-out",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
          )}
        >
          <button
            onClick={handleQuickAdd}
            className="w-full bg-white/98 backdrop-blur-sm text-[#1a1a1a] text-[11px] font-semibold tracking-[0.15em] uppercase py-3 hover:bg-[#1a1a1a] hover:text-white transition-colors flex items-center justify-between px-4 border-t border-[#e5e7eb]/50"
          >
            <span>Add to Basket</span>
            <ShoppingBag size={13} strokeWidth={1.75} />
          </button>
        </div>
      </Link>

      {/* ═══════════════════════════════════════════════
          TEXT BLOCK — editorial, minimal
          ═══════════════════════════════════════════════ */}
      <div className="px-0.5 space-y-1.5">
        {/* Gold uppercase category */}
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#c9a96e]">
          {product.collection || "Denova"}
        </p>

        {/* Product name — UPPERCASE editorial */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-xs sm:text-[13px] font-medium tracking-[0.08em] uppercase text-[#1a1a1a] hover:text-[#c9a96e] transition-colors leading-snug line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
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

        {/* Color swatches — small squares, Outfitters style */}
        {uniqueColors.length > 0 && (
          <div className="flex items-center gap-1 pt-1">
            {uniqueColors.slice(0, 6).map((color) => (
              <span
                key={color.hex}
                className="w-2.5 h-2.5 border border-[#d1d5db]"
                style={{ backgroundColor: color.hex }}
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