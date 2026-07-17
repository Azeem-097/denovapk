import { ProductCard } from "./ProductCard";
import { SlideUp }     from "@/components/animations/SlideUp";
import { FadeIn }      from "@/components/animations/FadeIn";
import type { Product } from "@/types";

interface RelatedProductsProps {
  products:        Product[];
  currentProductId: string;
}

export function RelatedProducts({
  products,
  currentProductId,
}: RelatedProductsProps) {
  const related = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="py-14 sm:py-16 border-t border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <FadeIn>
          <h2 className="text-sm sm:text-base font-bold tracking-[0.2em] uppercase text-[#1a1a1a] mb-8 sm:mb-10">
            You May Also Like
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:gap-x-6 lg:gap-y-12">
          {related.map((product, i) => (
            <SlideUp key={product.id} stagger={80} index={i}>
              <ProductCard product={product} />
            </SlideUp>
          ))}
        </div>

      </div>
    </section>
  );
}