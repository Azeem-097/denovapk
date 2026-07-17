import { ProductCard }       from "./ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { SlideUp }            from "@/components/animations/SlideUp";
import type { Product }       from "@/types";

interface ProductGridProps {
  products:  Product[];
  isLoading?: boolean;
  columns?:  2 | 3 | 4;
}

const colClasses = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

export function ProductGrid({
  products,
  isLoading = false,
  columns = 4,
}: ProductGridProps) {

  if (isLoading) {
    return (
      <div className={`grid ${colClasses[columns]} gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:gap-x-6 lg:gap-y-12`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-[#f5f0e8] rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-[#c9a96e]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-[#1a1a1a] mb-1">
          No products found
        </h3>
        <p className="text-sm text-[#6b7280]">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${colClasses[columns]} gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:gap-x-6 lg:gap-y-12`}>
      {products.map((product, i) => (
        <SlideUp key={product.id} stagger={60} index={i % 8}>
          <ProductCard product={product} />
        </SlideUp>
      ))}
    </div>
  );
}