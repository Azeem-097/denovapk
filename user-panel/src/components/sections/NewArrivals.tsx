"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { SlideUp } from "@/components/animations/SlideUp";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

type Tab = "new" | "bestsellers";

interface Props {
  newArrivals: Product[];
  bestSellers: Product[];
}

export function NewArrivals({ newArrivals, bestSellers }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("new");
  const displayProducts = activeTab === "new" ? newArrivals : bestSellers;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#fafaf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 lg:mb-14">
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">Discover</span>
          </FadeIn>
          <TextReveal as="h2" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 block">
              Trending Now
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <div className="flex items-center justify-center gap-6 mt-6">
              <button onClick={() => setActiveTab("new")}
                className={cn("text-sm font-medium tracking-wide pb-1.5 border-b-2 transition-all duration-200",
                  activeTab === "new" ? "border-[#c9a96e] text-[#1a1a1a]" : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]")}>
                New Arrivals
              </button>
              <button onClick={() => setActiveTab("bestsellers")}
                className={cn("text-sm font-medium tracking-wide pb-1.5 border-b-2 transition-all duration-200",
                  activeTab === "bestsellers" ? "border-[#c9a96e] text-[#1a1a1a]" : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]")}>
                Best Sellers
              </button>
            </div>
          </FadeIn>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {displayProducts.slice(0, 8).map((product, i) => (
            <SlideUp key={product.id} stagger={80} index={i}>
              <ProductCard product={product} />
            </SlideUp>
          ))}
        </div>

        <FadeIn delay={500}>
          <div className="text-center mt-10 lg:mt-14">
            <Link href={activeTab === "new" ? "/shop?filter=new" : "/shop?filter=bestsellers"}
              className="group inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#c9a96e] transition-all duration-300">
              View All {activeTab === "new" ? "New Arrivals" : "Best Sellers"}
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}