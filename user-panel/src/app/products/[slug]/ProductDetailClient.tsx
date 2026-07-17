"use client";
import { useState, useMemo } from "react";
import { ShoppingBag, CheckCircle, Plus, Minus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductImages } from "@/components/product/ProductImages";
import { ColorSelector } from "@/components/product/ColorSelector";
import { SizeSelector } from "@/components/product/SizeSelector";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { FadeIn } from "@/components/animations/FadeIn";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

// Editorial PKR formatter — "PKR 6,990"
function formatPKR(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString("en-PK")}`;
}

interface Props {
  product:         Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: Props) {
  // ─── Unique colors ────────────────────────────────────
  const uniqueColors = useMemo(() =>
    Array.from(
      new Map(product.variants.map((v) => [v.color, { name: v.color, hex: v.colorHex }])).values()
    ),
    [product.variants]
  );

  const firstInStockColor = useMemo(() => {
    const inStock = product.variants.find((v) => v.stock > 0);
    return inStock?.color ?? uniqueColors[0]?.name ?? "";
  }, [product.variants, uniqueColors]);

  const [selectedColor, setSelectedColor] = useState(firstInStockColor);

  // ─── Sizes derived from variants of selected color ────
  const sizesForColor = useMemo(() => {
    const variants = product.variants.filter((v) => v.color === selectedColor);
    return Array.from(new Set(variants.map((v) => v.size)));
  }, [product.variants, selectedColor]);

  const outOfStockSizes = useMemo(() => {
    return product.variants
      .filter((v) => v.color === selectedColor && v.stock === 0)
      .map((v) => v.size);
  }, [product.variants, selectedColor]);

  const firstInStockSize = useMemo(() => {
    const v = product.variants.find((x) => x.color === selectedColor && x.stock > 0);
    return v?.size ?? sizesForColor[0] ?? "";
  }, [product.variants, selectedColor, sizesForColor]);

  const [selectedSize, setSelectedSize] = useState(firstInStockSize);

  // Re-sync size when color changes
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const firstAvail = product.variants.find((v) => v.color === color && v.stock > 0);
    setSelectedSize(firstAvail?.size ?? "");
  };

  // ─── Quantity + cart ──────────────────────────────────
  const [quantity, setQuantity]         = useState(1);
  const [addedToCart, setAddedToCart]   = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("details");

  const addToCart = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.addToast);

  const selectedVariant = useMemo(() =>
    product.variants.find((v) => v.color === selectedColor && v.size === selectedSize),
    [product.variants, selectedColor, selectedSize]
  );

  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;
  const hasDiscount  = product.compareAtPrice && product.compareAtPrice > product.price;
  const primaryImage = product.images.find((i) => i.isPrimary) || product.images[0];

  // ─── Fit label + measurements (for accordion content) ─
  const measurements = [
    { label: "Waist",  value: product.waist,  unit: '"' },
    { label: "Length", value: product.length, unit: '"' },
    { label: "Bottom", value: product.bottom, unit: '"' },
  ].filter((m) => m.value != null);

  const fitLabel = useMemo(() => {
    if (product.waist === null || product.waist === undefined) return null;
    const w = `${product.waist}W`;
    const l = product.length !== null && product.length !== undefined ? ` x ${product.length}L` : "";
    return `${w}${l}`;
  }, [product.waist, product.length]);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      showToast({ type: "error", message: "Please select a size" });
      return;
    }
    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      name:      product.name,
      image:     primaryImage.url,
      size:      selectedVariant.size,
      color:     selectedColor,
      colorHex:  selectedVariant.colorHex,
      price:     product.price,
      quantity,
      slug:      product.slug,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  return (
    <>
      <div className="pt-24 sm:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:gap-14">

            {/* ═══════════════════════════════════════════
                LEFT: image grid
                ═══════════════════════════════════════════ */}
            <FadeIn>
              <ProductImages
                images={product.images}
                productName={product.name}
                productId={product.id}
                productSlug={product.slug}
                productPrice={product.price}
              />
            </FadeIn>

            {/* ═══════════════════════════════════════════
                RIGHT: sticky content column
                ═══════════════════════════════════════════ */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <FadeIn delay={100}>

                {/* Product name — bold sans uppercase */}
                <h1 className="text-lg sm:text-xl font-bold tracking-[0.1em] uppercase text-[#1a1a1a] leading-tight mb-2">
                  {product.name}
                </h1>

                {/* Collection sub-label */}
                <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#6b7280] mb-5">
                  {product.collection || "Premium"}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-xl sm:text-2xl font-bold text-[#1a1a1a] tracking-wide">
                    {formatPKR(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-[#9ca3af] line-through">
                      {formatPKR(product.compareAtPrice!)}
                    </span>
                  )}
                </div>

                {/* Color selector */}
                {uniqueColors.length > 0 && (
                  <div className="mb-7">
                    <ColorSelector
                      colors={uniqueColors}
                      selectedColor={selectedColor}
                      onSelect={handleColorChange}
                    />
                  </div>
                )}

                {/* Size selector */}
                {sizesForColor.length > 0 && (
                  <div className="mb-7">
                    <SizeSelector
                      sizes={sizesForColor}
                      selectedSize={selectedSize}
                      onSelect={setSelectedSize}
                      outOfStock={outOfStockSizes}
                    />
                  </div>
                )}

                {/* Quantity — compact inline */}
                <div className="mb-6 flex items-center gap-4">
                  <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#1a1a1a]">
                    Quantity
                  </span>
                  <div className="flex items-center border border-[#d1d5db]">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center text-[#1a1a1a] hover:bg-[#fafaf9]"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-medium text-[#1a1a1a]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock ?? 10, q + 1))}
                      className="w-9 h-9 flex items-center justify-center text-[#1a1a1a] hover:bg-[#fafaf9]"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock < 5 && (
                    <span className="text-xs text-[#c9a96e] font-medium">
                      Only {selectedVariant.stock} left
                    </span>
                  )}
                </div>

                {/* Big ADD TO CART button — Outfitters style */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={cn(
                    "w-full h-14 flex items-center justify-between px-6 text-sm font-bold tracking-[0.15em] uppercase transition-all duration-200",
                    isOutOfStock
                      ? "bg-[#e5e7eb] text-[#6b7280] cursor-not-allowed"
                      : addedToCart
                      ? "bg-[#c9a96e] text-white"
                      : "bg-[#1a1a1a] text-white hover:bg-[#333333] active:scale-[0.99]"
                  )}
                >
                  <span>
                    {addedToCart
                      ? "Added to Cart"
                      : isOutOfStock
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </span>
                  {addedToCart ? (
                    <CheckCircle size={18} strokeWidth={2} />
                  ) : (
                    <ShoppingBag size={18} strokeWidth={1.75} />
                  )}
                </button>

                {/* ═══════════════════════════════════════
                    Description
                    ═══════════════════════════════════════ */}
                <div className="mt-10">
                  <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-[#1a1a1a] mb-3">
                    Product Description
                  </h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>

                {/* ═══════════════════════════════════════
                    Accordions
                    ═══════════════════════════════════════ */}
                <div className="mt-8 border-t border-[#e5e7eb]">

                  {/* PRODUCT DETAILS & COMPOSITION */}
                  <AccordionItem
                    id="details"
                    title="Product Details & Composition"
                    isOpen={openAccordion === "details"}
                    onToggle={() => toggleAccordion("details")}
                  >
                    <div className="space-y-4">
                      {fitLabel && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[#6b7280] font-medium">Fit:</span>
                          <span className="text-[#1a1a1a] font-semibold">{fitLabel}</span>
                        </div>
                      )}

                      {measurements.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold tracking-wide text-[#1a1a1a] uppercase mb-2">
                            Measurements
                          </p>
                          <div className="divide-y divide-[#e5e7eb] border border-[#e5e7eb]">
                            {measurements.map((m) => (
                              <div key={m.label} className="flex items-center justify-between px-4 py-2.5">
                                <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">
                                  {m.label}
                                </span>
                                <span className="text-sm font-semibold text-[#1a1a1a]">
                                  {m.value}{m.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {product.tags.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold tracking-wide text-[#1a1a1a] uppercase mb-2">
                            Style Tags
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-medium tracking-wide uppercase px-2.5 py-1 bg-[#fafaf9] border border-[#e5e7eb] text-[#6b7280]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionItem>

                  {/* SHIPPING & RETURNS */}
                  <AccordionItem
                    id="shipping"
                    title="Shipping & Returns"
                    isOpen={openAccordion === "shipping"}
                    onToggle={() => toggleAccordion("shipping")}
                  >
                    <div className="space-y-3 text-sm text-[#6b7280] leading-relaxed">
                      <div>
                        <span className="text-[#1a1a1a] font-semibold">Free Shipping</span>
                        <span> on every order across Pakistan. Standard delivery within 3-5 business days.</span>
                      </div>
                      <div>
                        <span className="text-[#1a1a1a] font-semibold">Easy Returns</span>
                        <span> within 7 days of delivery. Items must be unworn with original tags.</span>
                      </div>
                      <div>
                        <span className="text-[#1a1a1a] font-semibold">Authentic Quality</span>
                        <span> - 100% guaranteed. Every piece is quality-inspected before shipping.</span>
                      </div>
                    </div>
                  </AccordionItem>

                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>

      <RelatedProducts products={relatedProducts} currentProductId={product.id} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  ACCORDION ITEM — clean Outfitters style with + / -
// ═══════════════════════════════════════════════════════════
function AccordionItem({
  id, title, isOpen, onToggle, children,
}: {
  id:       string;
  title:    string;
  isOpen:   boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#e5e7eb]">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`accordion-${id}`}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <div className="flex items-center gap-3">
          <span className="text-[#1a1a1a] text-lg font-light w-4">
            {isOpen ? "-" : "+"}
          </span>
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#1a1a1a] group-hover:text-[#c9a96e] transition-colors">
            {title}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "text-[#6b7280] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <div
        id={`accordion-${id}`}
        className={cn(
          "grid transition-all duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-5 pl-7">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Prevent unused-var errors from Button import (still available if needed later)
void Button;