"use client";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps a product image with an optional configurable background color.
 *
 * Uses CSS `mix-blend-mode: multiply` — white pixels in the image become
 * transparent, letting the wrapper's background color show through.
 *
 * Works PERFECTLY when:
 *   - Image has a pure white (#FFFFFF) background
 *   - Product itself has minimal pure-white details
 *
 * If `bgColor` is null/undefined, renders children as-is (no blend applied).
 *
 * Usage:
 *   <ProductBgWrapper bgColor={product.bgColor} className="aspect-[4/5]">
 *     <Image src={...} alt={...} fill className="object-cover" />
 *   </ProductBgWrapper>
 */
interface Props {
  bgColor?:   string | null;
  className?: string;
  style?:     CSSProperties;
  children:   ReactNode;
}

export function ProductBgWrapper({ bgColor, className, style, children }: Props) {
  const hasBg = !!bgColor;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        ...style,
        ...(hasBg ? { backgroundColor: bgColor } : {}),
      }}
      data-product-bg={hasBg ? bgColor : undefined}
    >
      {hasBg ? (
        <div
          className="absolute inset-0 [&>img]:mix-blend-multiply [&_img]:mix-blend-multiply"
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}