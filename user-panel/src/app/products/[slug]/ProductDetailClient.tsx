"use client";
import { useState, useMemo } from "react";
import { Heart, Share2, ShoppingBag, CheckCircle, Package, RotateCcw, Shield, Ruler } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductImages } from "@/components/product/ProductImages";
import { ColorSelector } from "@/components/product/ColorSelector";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useToastStore } from "@/store/toastStore";
import { formatPrice, getDiscountPercent, getStars } from "@/lib/utils";
import type { Product } from "@/types";

const TRUST_BADGES = [
  { icon: Package,   label: "Free shipping",     sublabel: "on orders above PKR 5,000" },
  { icon: RotateCcw, label: "Easy returns",      sublabel: "within 7 days" },
  { icon: Shield,    label: "Authentic quality", sublabel: "100% guaranteed" },
];

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
  const [quantity,      setQuantity]      = useState(1);
  const [addedToCart,   setAddedToCart]   = useState(false);

  const addToCart      = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist   = useWishlistStore((s) => s.isInWishlist(product.id));
  const showToast      = useToastStore((s) => s.addToast);

  const selectedVariant = useMemo(() =>
    product.variants.find((v) => v.color === selectedColor),
    [product.variants, selectedColor]
  );

  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;

  const hasDiscount  = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct  = hasDiscount ? getDiscountPercent(product.compareAtPrice!, product.price) : 0;
  const primaryImage = product.images.find((i) => i.isPrimary) || product.images[0];

  const fitLabel = useMemo(() => {
    if (product.waist === null || product.waist === undefined) return null;
    const w = `${product.waist}W`;
    const l = product.length !== null && product.length !== undefined ? ` × ${product.length}L` : "";
    return `${w}${l}`;
  }, [product.waist, product.length]);

  const measurements = [
    { label: "Waist",  value: product.waist,  unit: '"' },
    { label: "Length", value: product.length, unit: '"' },
    { label: "Bottom", value: product.bottom, unit: '"' },
  ].filter((m) => m.value != null);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart({
      productId: product.id, variantId: selectedVariant.id, name: product.name,
      image: primaryImage.url, size: selectedVariant.size, color: selectedColor,
      colorHex: selectedVariant.colorHex, price: product.price, quantity, slug: product.slug,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleWishlist = () => {
    toggleWishlist({
      id: product.id, productId: product.id, name: product.name,
      image: primaryImage.url, price: product.price, slug: product.slug,
    });
    showToast({ type: "success", message: isInWishlist ? "Removed from wishlist" : "Added to wishlist" });
  };

  const handleShare = async () => {
    try { await navigator.share({ title: product.name, url: window.location.href }); }
    catch {
      await navigator.clipboard.writeText(window.location.href);
      showToast({ type: "info", message: "Link copied to clipboard!" });
    }
  };

  return (
    <>
      <div className="pt-24 sm:pt-28 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb className="mb-6" items={[
              { label: "Home",             href: "/" },
              { label: "Shop",             href: "/shop" },
              { label: product.collection, href: `/collections/${product.collectionId}` },
              { label: product.name },
            ]} />
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
            <FadeIn>
              <ProductImages images={product.images} productName={product.name} />
            </FadeIn>

            <div className="flex flex-col">
              <FadeIn>
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.isNew        && <Badge variant="new">New Arrival</Badge>}
                  {hasDiscount          && <Badge variant="sale">-{discountPct}% Off</Badge>}
                  {product.isBestSeller && <Badge variant="bestseller">Best Seller</Badge>}
                </div>
              </FadeIn>

              <FadeIn delay={50}>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#c9a96e] mb-2">
                  {product.collection}
                </p>
              </FadeIn>

              <TextReveal as="h1" delay={80}>
                <span className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a1a1a] leading-tight">
                  {product.name}
                </span>
              </TextReveal>

              {fitLabel && (
                <FadeIn delay={100}>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#c9a96e]">
                    <Ruler size={13} />
                    Fit: {fitLabel}
                  </div>
                </FadeIn>
              )}

              <FadeIn delay={150}>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-0.5">
                    {getStars(product.rating).map((filled, i) => (
                      <svg key={i} className={`w-4 h-4 ${filled ? "text-[#c9a96e]" : "text-[#e5e7eb]"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-[#6b7280]">{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
                </div>
              </FadeIn>

              <FadeIn delay={200}>
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">{formatPrice(product.price)}</span>
                  {hasDiscount && <span className="text-base text-[#6b7280] line-through">{formatPrice(product.compareAtPrice!)}</span>}
                  {hasDiscount && <span className="text-sm font-semibold text-[#c9a96e]">Save {formatPrice(product.compareAtPrice! - product.price)}</span>}
                </div>
              </FadeIn>

              <div className="my-5 h-px bg-[#e5e7eb]" />

              {uniqueColors.length > 0 && (
                <FadeIn delay={250}>
                  <div className="mb-5">
                    <ColorSelector
                      colors={uniqueColors}
                      selectedColor={selectedColor}
                      onSelect={setSelectedColor}
                    />
                  </div>
                </FadeIn>
              )}

              <FadeIn delay={350}>
                <div className="mb-6">
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] block mb-3">Quantity</span>
                  <div className="flex items-center border border-[#e5e7eb] w-fit">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-[#1a1a1a] hover:bg-[#fafaf9] text-lg">−</button>
                    <span className="w-12 text-center text-sm font-medium text-[#1a1a1a]">{quantity}</span>
                    <button onClick={() => setQuantity((q) => Math.min(10, q + 1))} className="w-10 h-10 flex items-center justify-center text-[#1a1a1a] hover:bg-[#fafaf9] text-lg">+</button>
                  </div>
                  {selectedVariant && (
                    <p className={`mt-2 text-xs ${selectedVariant.stock === 0 ? "text-red-500 font-semibold" : selectedVariant.stock < 5 ? "text-orange-500 font-medium" : "text-[#6b7280]"}`}>
                      {selectedVariant.stock === 0
                        ? "Out of stock"
                        : selectedVariant.stock < 5
                          ? `Only ${selectedVariant.stock} left in stock`
                          : `${selectedVariant.stock} in stock`}
                    </p>
                  )}
                </div>
              </FadeIn>

              <FadeIn delay={400}>
                <div className="flex gap-3 mb-6">
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1 gap-2"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                  >
                    {addedToCart ? (
                      <><CheckCircle size={18} /> Added to Cart!</>
                    ) : isOutOfStock ? (
                      <>Out of Stock</>
                    ) : (
                      <><ShoppingBag size={18} /> Add to Cart</>
                    )}
                  </Button>
                  <button onClick={handleWishlist}
                    className={`w-14 h-14 flex items-center justify-center border transition-all ${
                      isInWishlist ? "border-[#c9a96e] bg-[#c9a96e] text-white" : "border-[#e5e7eb] text-[#6b7280] hover:border-[#c9a96e] hover:text-[#c9a96e]"
                    }`} aria-label="Add to wishlist">
                    <Heart size={20} fill={isInWishlist ? "currentColor" : "none"} />
                  </button>
                  <button onClick={handleShare} className="w-14 h-14 flex items-center justify-center border border-[#e5e7eb] text-[#6b7280] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-all" aria-label="Share product">
                    <Share2 size={18} />
                  </button>
                </div>
              </FadeIn>

              {/* ── Description ── */}
              <FadeIn delay={450}>
                <div className="mt-1 pt-5 border-t border-[#e5e7eb]">
                  <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-3">Description</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{product.description}</p>
                </div>
              </FadeIn>

              {product.tags.length > 0 && (
                <FadeIn delay={475}>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-medium tracking-wide uppercase px-2.5 py-1 bg-[#fafaf9] border border-[#e5e7eb] text-[#6b7280]">{tag}</span>
                    ))}
                  </div>
                </FadeIn>
              )}

              {/* ── Fit & Measurements ── */}
              {measurements.length > 0 && (
                <FadeIn delay={500}>
                  <div className="mt-5 border border-[#e5e7eb]">
                    <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#fafaf9] flex items-center gap-2">
                      <Ruler size={13} className="text-[#c9a96e]" />
                      <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
                        Fit &amp; Measurements
                      </h3>
                    </div>
                    <div className="divide-y divide-[#e5e7eb]">
                      {measurements.map((m) => (
                        <div key={m.label} className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">{m.label}</span>
                          <span className="text-sm font-semibold text-[#1a1a1a]">
                            {m.value}{m.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* ── Trust badges ── */}
              <FadeIn delay={550}>
                <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[#e5e7eb]">
                  {TRUST_BADGES.map(({ icon: Icon, label, sublabel }) => (
                    <div key={label} className="flex flex-col items-center text-center gap-1.5">
                      <Icon size={18} className="text-[#c9a96e]" />
                      <span className="text-[10px] font-semibold text-[#1a1a1a] leading-tight">{label}</span>
                      <span className="text-[9px] text-[#6b7280] leading-tight hidden sm:block">{sublabel}</span>
                    </div>
                  ))}
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