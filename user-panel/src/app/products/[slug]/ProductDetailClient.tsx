"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag, CheckCircle, ChevronDown, Plus, Minus, Truck,
} from "lucide-react";
import { ProductImages } from "@/components/product/ProductImages";
import { ColorSelector } from "@/components/product/ColorSelector";
import { SizeSelector } from "@/components/product/SizeSelector";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { LiveViewCounter } from "@/components/product/LiveViewCounter";

import { FadeIn } from "@/components/animations/FadeIn";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { trackMetaEvent } from "@/lib/metaPixel";
import { cn, getDiscountPercent } from "@/lib/utils";
import type { Product } from "@/types";

function formatPKR(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString("en-PK")}`;
}

type AccordionId = "details" | "description" | "shipping";

interface Props {
  product:         Product;
  relatedProducts: Product[];
}

// ══════════════════════════════════════════════════════════
//  RECENTLY VIEWED
// ══════════════════════════════════════════════════════════
const RECENTLY_VIEWED_KEY = "denova_recently_viewed_v1";
const MAX_RECENT = 8;

function pushRecentlyViewed(product: Product) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    const list: Product[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((p) => p.id !== product.id);
    filtered.unshift(product);
    window.localStorage.setItem(
      RECENTLY_VIEWED_KEY,
      JSON.stringify(filtered.slice(0, MAX_RECENT))
    );
  } catch {}
}

// ══════════════════════════════════════════════════════════
//  ELO-STYLE COUNTDOWN — clean centered plain numbers
// ══════════════════════════════════════════════════════════
const COUNTDOWN_MIN_HOURS = 24;
const COUNTDOWN_MAX_HOURS = 72;

function getSaleDeadline(productId: string): number {
  if (typeof window === "undefined") return Date.now() + COUNTDOWN_MIN_HOURS * 3_600_000;
  const key = "denova_sale_expires_" + productId;
  const stored = window.localStorage.getItem(key);
  if (stored) {
    const ts = Number(stored);
    if (!isNaN(ts) && ts > Date.now()) return ts;
  }
  const hours = COUNTDOWN_MIN_HOURS + Math.random() * (COUNTDOWN_MAX_HOURS - COUNTDOWN_MIN_HOURS);
  const deadline = Date.now() + hours * 3_600_000;
  window.localStorage.setItem(key, String(deadline));
  return deadline;
}

interface Parts { d: number; h: number; m: number; s: number; expired: boolean }

function computeTime(deadline: number): Parts {
  const diff = deadline - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
    expired: false,
  };
}

function EloCountdown({ productId }: { productId: string }) {
  const [mounted, setMounted] = useState(false);
  const [dl, setDl] = useState(0);
  const [t, setT] = useState<Parts>({ d: 0, h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    setMounted(true);
    setDl(getSaleDeadline(productId));
  }, [productId]);

  useEffect(() => {
    if (!dl) return;
    const tick = () => {
      const next = computeTime(dl);
      if (next.expired) {
        const fresh = Date.now() + (COUNTDOWN_MIN_HOURS + Math.random() * (COUNTDOWN_MAX_HOURS - COUNTDOWN_MIN_HOURS)) * 3_600_000;
        window.localStorage.setItem("denova_sale_expires_" + productId, String(fresh));
        setDl(fresh);
        setT(computeTime(fresh));
      } else {
        setT(next);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dl, productId]);

  if (!mounted) return <div className="h-[120px]" aria-hidden />;

  const cells = [
    { label: "Days",    v: t.d },
    { label: "Hours",   v: t.h },
    { label: "Minutes", v: t.m },
    { label: "Seconds", v: t.s },
  ];

  return (
    <div className="text-center py-4">
      <h2 className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a] mb-5 tracking-tight">
        Sale ends in
      </h2>
      <div className="flex items-start justify-center gap-6 sm:gap-10">
        {cells.map((c) => (
          <div key={c.label} className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] leading-none tabular-nums">
              {String(c.v).padStart(2, "0")}
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6b7280] mt-2">
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════
export function ProductDetailClient({ product, relatedProducts }: Props) {
  const router = useRouter();

  useEffect(() => {
    pushRecentlyViewed(product);
  }, [product]);

  const uniqueColors = useMemo(() =>
    Array.from(
      new Map(product.variants.map((v) => [v.color, { name: v.color, hex: v.colorHex }])).values()
    ),
    [product.variants]
  );

  const measurementRows = useMemo(() => {
    if (product.measurements && product.measurements.length > 0) return product.measurements;

    const fallbackRows = [] as NonNullable<typeof product.measurements>;
    if (product.waist != null) {
      fallbackRows.push({ waist: product.waist, length: product.length ?? null, bottom: product.bottom ?? null });
    }
    return fallbackRows;
  }, [product.measurements, product.waist, product.length, product.bottom]);

  const waistSizes = useMemo(() => {
    const seen = new Set<string>();
    const sizes: string[] = [];
    measurementRows.forEach((row) => {
      const value = String(row.waist);
      if (!seen.has(value)) {
        seen.add(value);
        sizes.push(value);
      }
    });
    return sizes;
  }, [measurementRows]);

  const firstInStockColor = useMemo(() => {
    const inStock = product.variants.find((v) => v.stock > 0);
    return inStock?.color ?? uniqueColors[0]?.name ?? "";
  }, [product.variants, uniqueColors]);

  const [selectedColor, setSelectedColor] = useState(firstInStockColor);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.color === selectedColor) ?? product.variants[0],
    [product.variants, selectedColor]
  );

  const sizesForColor = useMemo(() => {
    return waistSizes;
  }, [waistSizes]);

  const outOfStockSizes = useMemo(() => {
    return selectedVariant && selectedVariant.stock === 0 ? sizesForColor : [];
  }, [selectedVariant, sizesForColor]);

  const firstInStockSize = useMemo(() => {
    return sizesForColor[0] ?? "";
  }, [sizesForColor]);

  const [selectedSize, setSelectedSize] = useState(firstInStockSize);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(waistSizes[0] ?? "");
  };

  const [quantity, setQuantity]           = useState(1);
  const [addedToCart, setAddedToCart]     = useState(false);
  const [openAccordions, setOpenAccordions] = useState<Set<AccordionId>>(
    () => new Set(["details", "description", "shipping"])
  );

  const addToCart = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.addToast);

  const isOutOfStock    = !selectedVariant || selectedVariant.stock === 0;
  const maxQty          = selectedVariant?.stock ?? 1;
  const hasDiscount     = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount ? getDiscountPercent(product.compareAtPrice!, product.price) : 0;

  useEffect(() => {
    if (quantity > maxQty) setQuantity(Math.max(1, maxQty));
  }, [maxQty, quantity]);

  const brandLine = (product.brand && product.brand.trim().length > 0)
    ? product.brand.trim()
    : (product.collection || "Denova");

  const primaryImage = product.images.find((i) => i.isPrimary) || product.images[0];
  const displaySku = product.sku || selectedVariant?.sku || "";
  const viewContentSku = product.sku || product.variants[0]?.sku || product.id;

  useEffect(() => {
    trackMetaEvent("ViewContent", {
      content_ids: [viewContentSku],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "PKR",
    });
  }, [product.id, product.name, product.price, viewContentSku]);

  const measurements = [
    { label: "Waist", values: waistSizes },
    {
      label: "Length",
      values: Array.from(new Set(measurementRows.map((row) => row.length).filter((value): value is number => value != null))).map(String),
    },
    {
      label: "Bottom",
      values: Array.from(new Set(measurementRows.map((row) => row.bottom).filter((value): value is number => value != null))).map(String),
    },
  ].filter((m) => m.values.length > 0);

  const doAddToCart = async () => {
    if (!selectedVariant) {
      showToast({ type: "error", message: "Please select a size" });
      return false;
    }
    await addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      name:      product.name,
      image:     primaryImage.url,
      size:      selectedSize || selectedVariant.size,
      color:     selectedColor,
      colorHex:  selectedVariant.colorHex,
      price:     product.price,
      quantity,
      stock:     selectedVariant.stock,
      slug:      product.slug,
      bgColor:   product.bgColor,
    });

    trackMetaEvent("AddToCart", {
      content_ids: [selectedVariant.sku || product.sku || product.id],
      content_name: product.name,
      content_type: "product",
      value: product.price * quantity,
      currency: "PKR",
      num_items: quantity,
    });

    return true;
  };

  const handleAddToCart = async () => {
    const ok = await doAddToCart();
    if (!ok) return;
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = async () => {
    const ok = await doAddToCart();
    if (!ok) return;
    trackMetaEvent("InitiateCheckout", {
      value: product.price * quantity,
      currency: "PKR",
      num_items: quantity,
    });
    router.push("/checkout");
  };

  const toggleAccordion = (key: AccordionId) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <>
      <div className="pt-6 sm:pt-8 pb-16 border-t border-[#e5e7eb]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_3fr] gap-8 lg:gap-20 xl:gap-28 2xl:gap-32">

            {/* ═══ LEFT: Image gallery ══════════════════════ */}
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

            {/* ═══ RIGHT: Info column ═══════════════════════ */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <FadeIn delay={100}>

                {/* 1. COUNTDOWN — clean, centered, plain numbers (ELO exact) */}
                {hasDiscount && (
                  <div className="pb-6 mb-6 border-b border-[#e5e7eb]">
                    <EloCountdown productId={product.id} />
                  </div>
                )}

                {/* 2. PRODUCT NAME — simple sentence-case, no letter-spacing */}
                <h1 className="text-2xl sm:text-[26px] font-semibold text-[#1a1a1a] leading-tight mb-3">
                  {product.name}
                </h1>

                {/* 3. DEAL PILLS — orange "{discountPercent}% OFF" + green "Bundle Offer" (ELO exact) */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {hasDiscount && (
                    <span className="inline-flex items-center bg-[#ff6a1a] text-white px-3 py-1 text-[11px] font-bold tracking-wide rounded-sm">
                      {discountPercent}% OFF
                    </span>
                  )}
                  <span className="inline-flex items-center bg-[#12b76a] text-white px-3 py-1 text-[11px] font-bold tracking-wide rounded-sm">
                    Free Delivery
                  </span>
                </div>

                {/* 4. BRAND — subtle brand line under pills */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#F97316]">
                    {brandLine}
                  </span>
                </div>

                {/* 5. REAL SKU — plain gray text like ELO */}
                {displaySku && (
                  <p className="text-sm text-[#1a1a1a] mb-3">
                    SKU: <span className="text-[#1a1a1a]">{displaySku}</span>
                  </p>
                )}

                {/* 6. PRICE — current + strikethrough + small black "Save X%" chip */}
                <div className="flex items-center gap-2.5 flex-wrap mb-6">
                  <span className="text-xl sm:text-2xl font-semibold text-[#1a1a1a] leading-none">
                    {formatPKR(product.price)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-base sm:text-lg text-[#9ca3af] line-through leading-none">
                        {formatPKR(product.compareAtPrice!)}
                      </span>
                      <span className="inline-flex items-center bg-[#1a1a1a] text-white text-[11px] font-semibold px-2 py-1 leading-none rounded-sm">
                        Save {discountPercent}%
                      </span>
                    </>
                  )}
                </div>

                {/* 7. COLOR SELECTOR — rectangular labeled buttons */}
                {uniqueColors.length > 0 && (
                  <div className="mb-6">
                    <ColorSelector
                      colors={uniqueColors}
                      selectedColor={selectedColor}
                      onSelect={handleColorChange}
                    />
                  </div>
                )}

                {/* 8. WAIST SELECTOR — rectangular labeled buttons */}
                {sizesForColor.length > 0 && (
                  <div className="mb-4">
                    <SizeSelector
                      sizes={sizesForColor}
                      selectedSize={selectedSize}
                      onSelect={setSelectedSize}
                      outOfStock={outOfStockSizes}
                      label="Waist"
                    />
                  </div>
                )}



                {/* 10. QUANTITY STEPPER */}
                <div className="mb-5">
                  <div className="mb-3">
                    <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#1a1a1a]">
                      Quantity
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center border border-[#1a1a1a] rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="w-11 h-11 flex items-center justify-center text-[#1a1a1a] hover:bg-[#fafaf9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} strokeWidth={2} />
                      </button>
                      <span className="w-14 h-11 flex items-center justify-center text-sm font-bold text-[#1a1a1a] border-x border-[#1a1a1a] tabular-nums">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                        disabled={quantity >= maxQty || isOutOfStock}
                        className="w-11 h-11 flex items-center justify-center text-[#1a1a1a] hover:bg-[#fafaf9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} strokeWidth={2} />
                      </button>
                    </div>
                    {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock < 5 && (
                      <span className="text-xs text-[#e32c52] font-bold whitespace-nowrap">
                        Only {selectedVariant.stock} left
                      </span>
                    )}
                  </div>
                </div>

                {/* 11 + 12. ADD TO CART + BUY IT NOW */}
                <div className="space-y-2.5 mb-5">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={cn(
                      "w-full h-12 flex items-center justify-center gap-2 text-[13px] font-bold tracking-[0.15em] uppercase transition-all duration-200 rounded-lg",
                      isOutOfStock
                        ? "bg-[#e5e7eb] text-[#6b7280] cursor-not-allowed"
                        : addedToCart
                        ? "bg-[#1a1a1a] text-white"
                        : "bg-[#F97316] text-white hover:bg-[#C2410C] active:scale-[0.99]"
                    )}
                  >
                    {addedToCart ? (
                      <>
                        <CheckCircle size={17} strokeWidth={2.25} />
                        <span>Added to Cart</span>
                      </>
                    ) : isOutOfStock ? (
                      <span>Out of Stock</span>
                    ) : (
                      <>
                        <ShoppingBag size={17} strokeWidth={1.75} />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={cn(
                      "w-full h-12 flex items-center justify-center gap-2 text-[13px] font-bold tracking-[0.15em] uppercase transition-all duration-200 rounded-lg",
                      isOutOfStock
                        ? "bg-[#e5e7eb] text-[#6b7280] cursor-not-allowed"
                        : "bg-[#1a1a1a] text-white hover:bg-[#333333] active:scale-[0.99]"
                    )}
                  >
                    Buy It Now
                  </button>
                </div>

                {/* 13. LIVE VIEWERS */}
                <div className="mb-6 flex items-center justify-between gap-3 py-3 border-t border-b border-[#e5e7eb]">
                  <LiveViewCounter productId={product.id} />
                </div>

                {/* 15. ACCORDIONS */}
                <div className="border-t border-[#e5e7eb]">
                  <AccordionItem
                    id="details"
                    title="Size Chart"
                    isOpen={openAccordions.has("details")}
                    onToggle={() => toggleAccordion("details")}
                  >
                    <div className="space-y-4">
                      {measurements.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold tracking-wide text-[#1a1a1a] uppercase mb-2">
                            Measurements
                          </p>
                          <div className="divide-y divide-[#e5e7eb] border border-[#e5e7eb]">
                            {measurements.map((m) => (
                              <div key={m.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                                <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">
                                  {m.label.toLowerCase()}
                                </span>
                                <span className="text-sm font-semibold text-[#1a1a1a] text-right">
                                  {m.values.join(",")}
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
                    id="description"
                    title="Description"
                    isOpen={openAccordions.has("description")}
                    onToggle={() => toggleAccordion("description")}
                  >
                    <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </AccordionItem>

                  <AccordionItem
                    id="shipping"
                    title="Delivery Details"
                    isOpen={openAccordions.has("shipping")}
                    onToggle={() => toggleAccordion("shipping")}
                  >
                    <div className="space-y-3 text-sm text-[#6b7280] leading-relaxed">
                      <div>
                        <span className="text-[#1a1a1a] font-semibold">Free Shipping</span>
                        <span> across Pakistan. Standard delivery within 3-5 business days.</span>
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
        <span className="text-sm font-semibold text-[#1a1a1a] group-hover:text-[#F97316] transition-colors">
          {title}
        </span>
        <ChevronDown
          size={16}
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
          <div className="pb-5 pr-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
