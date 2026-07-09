"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useToastStore } from "@/store/toastStore";
import { cn, formatPrice, getDiscountPercent } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  const addToCart      = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist   = useWishlistStore((s) => s.isInWishlist(product.id));
  const showToast      = useToastStore((s) => s.addToast);

  useEffect(() => setMounted(true), []);

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? getDiscountPercent(product.compareAtPrice!, product.price)
    : 0;

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
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-[#fafaf9] mb-3"
      >
        <Image
          src={primaryImage.url}
          alt={primaryImage.alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew                    && <Badge variant="new">New</Badge>}
          {hasDiscount                       && <Badge variant="sale">-{discountPercent}%</Badge>}
          {product.isBestSeller && !product.isNew && <Badge variant="bestseller">Best Seller</Badge>}
        </div>

        <div className={cn(
          "absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 z-10",
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
        )}>
          <button
            onClick={handleWishlist}
            className={cn(
              "w-9 h-9 flex items-center justify-center bg-white shadow-md hover:bg-[#c9a96e] hover:text-white transition-all",
              mounted && isInWishlist && "bg-[#c9a96e] text-white"
            )}
            aria-label={mounted && isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={16} fill={mounted && isInWishlist ? "currentColor" : "none"} />
          </button>
        </div>

        <div className={cn(
          "absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 z-10",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}>
          <button
            onClick={handleQuickAdd}
            className="w-full bg-[#1a1a1a] text-white text-xs font-semibold tracking-wider uppercase py-3 hover:bg-[#c9a96e] transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <ShoppingBag size={13} />
            Quick Add
          </button>
        </div>
      </Link>

      <div className="px-0.5">
        <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#c9a96e] mb-1">
          {product.collection}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-[#1a1a1a] hover:text-[#c9a96e] transition-colors leading-snug mb-1.5 line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <svg key={i} className={cn("w-3 h-3", i < Math.round(product.rating) ? "text-[#c9a96e]" : "text-[#e5e7eb]")} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>
          <span className="text-[10px] text-[#6b7280]">({product.reviewCount})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#1a1a1a]">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-[#6b7280] line-through">{formatPrice(product.compareAtPrice!)}</span>
          )}
        </div>

        {uniqueColors.length > 1 && (
          <div className="flex items-center gap-1.5 mt-2">
            {uniqueColors.map((color) => (
              <span
                key={color.hex}
                className="w-3.5 h-3.5 rounded-full border border-[#e5e7eb]"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}