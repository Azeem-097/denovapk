import type { Metadata } from "next";
import { HeroSection }           from "@/components/sections/HeroSection";
import { FixedHeroBackground }   from "@/components/sections/FixedHeroBackground";
import { SaleCountdown }         from "@/components/sections/SaleCountdown";
import { BrandTicker }           from "@/components/sections/BrandTicker";
import { NewArrivals }           from "@/components/sections/NewArrivals";
import { BrandStory }            from "@/components/sections/BrandStory";
import { Testimonials }          from "@/components/sections/Testimonials";
import { GallerySection }        from "@/components/sections/GallerySection";
import { NewsletterSection }     from "@/components/sections/NewsletterSection";
import { getProducts }              from "@/lib/db/repositories/products";
import { getSetting, getNumberSetting } from "@/lib/db/repositories/settings";
import { adaptProduct, getMockTestimonials } from "@/lib/adapters";

type HeroBanner = {
  isActive: true;
  sortOrder: number;
};

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "https://denovapk.com" },
};

export default async function HomePage() {
  const [dbAllProducts, heroBannersRaw, heroRotation] = await Promise.all([
    getProducts({ status: "PUBLISHED", limit: 100, sortBy: "newest" }),
    getSetting("hero_banners"),
    getNumberSetting("hero_rotation_seconds", 8),
  ]);

  const allProducts  = dbAllProducts.map(adaptProduct);

  const premiumProducts      = allProducts.filter((p) => p.collection === "Premium");
  const superPremiumProducts = allProducts.filter((p) => p.collection === "Super Premium");

  const testimonials = getMockTestimonials();

  let heroBanners: HeroBanner[] = [];
  if (heroBannersRaw) {
    try {
      const all: unknown[] = JSON.parse(heroBannersRaw);
      heroBanners = all
        .filter(
          (b): b is HeroBanner =>
            typeof b === "object" &&
            b !== null &&
            (b as { isActive?: boolean }).isActive === true &&
            typeof (b as { sortOrder?: unknown }).sortOrder === "number"
        )
        .sort((a, b) => a.sortOrder - b.sortOrder);
    } catch { heroBanners = []; }
  }

  return (
    <>
      {/* LAYER 1 — HERO */}
      <FixedHeroBackground>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <HeroSection banners={heroBanners as any} rotationSeconds={heroRotation} />
      </FixedHeroBackground>

      {/* LAYER 2 — CONTENT SHELL
          - overflow-hidden clips the square backgrounds of Sale & Newsletter.
          - Because this wrapper is BELOW the header, overflow-hidden here 
            does NOT break the sticky header! */}
      <div
        className="relative z-10 bg-white rounded-t-[40px] sm:rounded-t-[50px] lg:rounded-t-[60px] rounded-b-[40px] sm:rounded-b-[50px] lg:rounded-b-[60px] overflow-hidden"
        style={{
          boxShadow: "0 -12px 40px -20px rgba(0, 0, 0, 0.15)",
        }}
      >
        <SaleCountdown />
        <BrandTicker />
        <NewArrivals
          products={allProducts}
          newArrivals={premiumProducts}
          bestSellers={superPremiumProducts}
        />
        <BrandStory />
        <Testimonials testimonials={testimonials} />
        <GallerySection />

        <div className="mt-12 sm:mt-16 lg:mt-20 bg-[#f5f0e8]">
          <NewsletterSection />
        </div>
      </div>
    </>
  );
}
