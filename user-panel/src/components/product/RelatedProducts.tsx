import { ProductCard } from "./ProductCard";
import { SlideUp }     from "@/components/animations/SlideUp";
import { FadeIn }      from "@/components/animations/FadeIn";
import { TextReveal }  from "@/components/animations/TextReveal";
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

        <div className="text-center mb-10">
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
              You May Also Like
            </span>
          </FadeIn>
          <TextReveal as="h2" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a1a1a] mt-3 block">
              Related Products
            </span>
          </TextReveal>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
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