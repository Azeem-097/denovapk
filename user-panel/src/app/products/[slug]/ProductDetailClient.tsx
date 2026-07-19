"use client";
import { useState, useMemo } from "react";
import { ShoppingBag, CheckCircle, Plus, Minus, ChevronDown, Flame, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductImages } from "@/components/product/ProductImages";
import { ColorSelector } from "@/components/product/ColorSelector";
import { SizeSelector } from "@/components/product/SizeSelector";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { SaleCountdown } from "@/components/product/SaleCountdown";
import { LiveViewCounter } from "@/components/product/LiveViewCounter";
import { FadeIn } from "@/components/animations/FadeIn";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { cn, getDiscountPercent } from "@/lib/utils";
import type { Product } from "@/types";

function formatPKR(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString("en-PK")}`;
}

interface Props {
  product:         Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: Props) {
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

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const firstAvail = product.variants.find((v) => v.color === color && v.stock > 0);
    setSelectedSize(firstAvail?.size ?? "");
  };

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
  const hasDiscount  = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? getDiscountPercent(product.compareAtPrice!, product.price)
    : 0;

  // Brand line — prefer explicit brand, fallback to collection
  const brandLine = (product.brand && product.brand.trim().length > 0)
    ? product.brand.trim()
    : (product.collection || "Denova");

  const primaryImage = product.images.find((i) => i.isPrimary) || product.images[0];

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
      bgColor:   product.bgColor,
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
        <div className="w-full lg:max-w-[80%] mx-auto px-3 sm:px-4 lg:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_3fr] gap-8 lg:gap-8 xl:gap-10">

            <FadeIn>
              <div className="w-full">
                <ProductImages
                  images={product.images}
                  productName={product.name}
                  productId={product.id}
                  productSlug={product.slug}
                  productPrice={product.price}
                  bgColor={product.bgColor}
                  discountPercent={discountPercent}
                />
              </div>
            </FadeIn>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <FadeIn delay={100}>

                {/* 1. Sale Ends In Countdown */}
                {hasDiscount && (
                  <div className="mb-4">
                    <SaleCountdown productId={product.id} className="mb-0 max-w-md" />
                  </div>
                )}

                {/* 2. Product Name */}
                <h1 className="text-xl sm:text-2xl font-bold tracking-[0.05em] uppercase text-[#1a1a1a] leading-tight mb-4">
                  {product.name}
                </h1>

                {/* 3. Badges: 50% OFF + Free Delivery */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  {hasDiscount && (
                    <span className="inline-flex items-center gap-1.5 bg-[#e32c52] text-white px-3 py-1.5 text-[11px] font-bold tracking-[0.15em] uppercase shadow-sm">
                      <Flame size={12} fill="currentColor" />
                      {discountPercent}% OFF
                    </span>
                  )}
                  <span className="inline-flex items-center bg-[#1a1a1a] text-white px-3 py-1.5 text-[11px] font-bold tracking-[0.15em] uppercase shadow-sm">
                    Free Delivery
                  </span>
                </div>

                {/* 4. Brand Information: Brand Name | International Brand */}
                <div className="flex items-center gap-2.5 mb-6">
                  <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#c9a96e]">
                    {brandLine}
                  </span>
                  <span className="text-[#e5e7eb] font-light">|</span>
                  <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#1a1a1a] bg-[#f5f0e8] px-2 py-1 flex items-center gap-1.5 border border-[#c9a96e]/30">
                    <Globe size={10} strokeWidth={2.5} className="text-[#c9a96e]" />
                    International Brand
                  </span>
                </div>

                {/* 5. Product Price */}
                <div className="flex items-end gap-3 flex-wrap mb-5 border-t border-[#e5e7eb] pt-6">
                  <span className="text-4xl sm:text-[42px] font-extrabold text-[#1a1a1a] tracking-tight leading-none">
                    {formatPKR(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xl sm:text-2xl text-[#9ca3af] line-through decoration-[#e32c52]/70 decoration-[2.5px] font-semibold leading-none pb-1">
                      {formatPKR(product.compareAtPrice!)}
                    </span>
                  )}
                </div>

                {/* 6. Product Views */}
                <div className="mb-7">
                  <LiveViewCounter productId={product.id} />
                </div>

                {/* 7. Color Selection */}
                {uniqueColors.length > 0 && (
                  <div className="mb-7">
                    <ColorSelector
                      colors={uniqueColors}
                      selectedColor={selectedColor}
                      onSelect={handleColorChange}
                    />
                  </div>
                )}

                {/* 8. Size Selection */}
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

                {/* 9. Quantity Selector */}
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
                    <span className="text-xs text-[#e32c52] font-bold">
                      Only {selectedVariant.stock} left
                    </span>
                  )}
                </div>

                {/* 10. Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={cn(
                    "w-full max-w-md h-12 flex items-center justify-between px-6 text-[13px] font-bold tracking-[0.15em] uppercase transition-all duration-200",
                    isOutOfStock
                      ? "bg-[#e5e7eb] text-[#6b7280] cursor-not-allowed"
                      : addedToCart
                      ? "bg-[#3b5f8f] text-white"
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

                {/* 11. Product Description */}
                <div className="mt-10">
                  <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-[#1a1a1a] mb-3 border-b border-[#1a1a1a] inline-block pb-1">
                    Product Description
                  </h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line mt-2">
                    {product.description}
                  </p>
                </div>

                <div className="mt-8 border-t border-[#e5e7eb]">
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
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#1a1a1a] group-hover:text-[#3b5f8f] transition-colors">
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

void Button;