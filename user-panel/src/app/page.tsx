import { HeroSection }           from "@/components/sections/HeroSection";
import { FixedHeroBackground }   from "@/components/sections/FixedHeroBackground";
import { SaleCountdown }         from "@/components/sections/SaleCountdown";
import { FeaturedCollections }   from "@/components/sections/FeaturedCollections";
import { BrandTicker }           from "@/components/sections/BrandTicker";
import { NewArrivals }           from "@/components/sections/NewArrivals";
import { BrandStory }            from "@/components/sections/BrandStory";
import { Testimonials }          from "@/components/sections/Testimonials";
import { GallerySection }        from "@/components/sections/GallerySection";
import { NewsletterSection }     from "@/components/sections/NewsletterSection";
import { getCollectionsWithCounts } from "@/lib/db/repositories/collections";
import { getProducts }              from "@/lib/db/repositories/products";
import { getSetting, getNumberSetting } from "@/lib/db/repositories/settings";
import { adaptCollection, adaptProduct, getMockTestimonials } from "@/lib/adapters";

type HeroBanner = {
  isActive: true;
  sortOrder: number;
};

export const revalidate = 300;

export default async function HomePage() {
  const [dbCollections, dbAllProducts, heroBannersRaw, heroRotation] = await Promise.all([
    getCollectionsWithCounts(),
    getProducts({ status: "PUBLISHED", limit: 100, sortBy: "newest" }),
    getSetting("hero_banners"),
    getNumberSetting("hero_rotation_seconds", 8),
  ]);

  const collections  = dbCollections.map(adaptCollection);
  const allProducts  = dbAllProducts.map(adaptProduct);

  // Split products by collection name for the two tabs
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
      {/* ═══════════════════════════════════════════════════════
          HERO — position:fixed, cannot move
          ═══════════════════════════════════════════════════════ */}
      <FixedHeroBackground>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <HeroSection banners={heroBanners as any} rotationSeconds={heroRotation} />
      </FixedHeroBackground>

      {/* ═══════════════════════════════════════════════════════
          REVEAL LAYER — slides up over the fixed hero on scroll.
          Contains only SaleCountdown now (Collections moved down).
          ═══════════════════════════════════════════════════════ */}
      <div className="relative z-10 bg-white rounded-t-[32px] sm:rounded-t-[44px] lg:rounded-t-[56px] overflow-hidden shadow-[0_-30px_60px_-20px_rgba(0,0,0,0.3)]">
        <SaleCountdown />
      </div>

      {/* ═══════════════════════════════════════════════════════
          BRAND TICKER — international brand collaborations
          ═══════════════════════════════════════════════════════ */}
      <div className="relative z-10">
        <BrandTicker />
      </div>

      {/* ═══════════════════════════════════════════════════════
          SHOP BY WAIST — now with Premium / Super Premium tabs
          ═══════════════════════════════════════════════════════ */}
      <div className="relative z-10 bg-white">
        <NewArrivals
          newArrivals={premiumProducts}
          bestSellers={superPremiumProducts}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════
          OUR COLLECTIONS — moved to appear AFTER Shop by Waist
          ═══════════════════════════════════════════════════════ */}
      <div className="relative z-10">
        <FeaturedCollections collections={collections} />
      </div>

      {/* ═══════════════════════════════════════════════════════
          Remaining sections
          ═══════════════════════════════════════════════════════ */}
      <div className="relative z-10 bg-white">
        <BrandStory />
        <Testimonials testimonials={testimonials} />
        <GallerySection />
        <NewsletterSection />
      </div>
    </>
  );
}