"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { SlideUp } from "@/components/animations/SlideUp";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const router = useRouter();
  const { items, removeItem, clearAll } = useWishlistStore();

  if (items.length === 0) {
    return <EmptyWishlist />;
  }

  return (
    <>
      {/* Page header */}
      <div className="pt-28 pb-8 sm:pt-32 sm:pb-10 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
              className="mb-4"
            />
          </FadeIn>
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <TextReveal as="h1">
                <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a]">
                  My Wishlist
                </span>
              </TextReveal>
              <FadeIn delay={100}>
                <p className="text-[#6b7280] text-sm mt-2">
                  {items.length} saved {items.length === 1 ? "item" : "items"}
                </p>
              </FadeIn>
            </div>
            <button
              onClick={() => {
                if (confirm("Clear all items from wishlist?")) clearAll();
              }}
              className="text-xs text-red-500 hover:text-red-700 transition-colors underline"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {items.map((item, i) => (
            <SlideUp key={item.id} stagger={60} index={i % 8}>
              <div className="group relative">

                {/* Image — clicking navigates to product */}
                <div
                  onClick={() => router.push(`/products/${item.slug}`)}
                  className="relative block aspect-[3/4] overflow-hidden bg-[#fafaf9] mb-3 cursor-pointer"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading="lazy"
                  />

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.productId);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white shadow-md text-[#6b7280] hover:bg-red-500 hover:text-white transition-all duration-200 z-10"
                    aria-label="Remove from wishlist"
                  >
                    <X size={14} />
                  </button>

                  {/* View product overlay — uses button, not Link (avoids nested <a>) */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/products/${item.slug}`);
                      }}
                      className="w-full bg-[#1a1a1a] text-white text-xs font-semibold tracking-wider uppercase py-3 hover:bg-[#E10600] transition-colors duration-200 inline-flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag size={13} />
                      View Product
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="px-0.5">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="text-sm font-medium text-[#1a1a1a] hover:text-[#E10600] transition-colors leading-snug mb-1.5 line-clamp-1">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-sm font-bold text-[#1a1a1a]">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>
            </SlideUp>
          ))}
        </div>

        {/* Continue shopping */}
        <FadeIn delay={300}>
          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-[#1a1a1a] hover:text-[#E10600] transition-colors"
            >
              Continue Shopping
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </FadeIn>
      </div>
    </>
  );
}

function EmptyWishlist() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-[#fafaf9]">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-24 h-24 mx-auto bg-white border border-[#e5e7eb] rounded-full flex items-center justify-center mb-6">
          <Heart size={36} className="text-[#E10600]" />
        </div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-3">
          Your wishlist is empty
        </h1>
        <p className="text-sm text-[#6b7280] mb-8 leading-relaxed">
          Save your favorite items to your wishlist and shop them later. Start exploring our collections.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#E10600] transition-colors duration-300"
        >
          Explore Collections
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}