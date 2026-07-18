import { HeroSection }          from "@/components/sections/HeroSection";
import { FeaturedCollections }  from "@/components/sections/FeaturedCollections";
import { NewArrivals }          from "@/components/sections/NewArrivals";
import { BrandStory }           from "@/components/sections/BrandStory";
import { Testimonials }         from "@/components/sections/Testimonials";
import { GallerySection }       from "@/components/sections/GallerySection";
import { NewsletterSection }    from "@/components/sections/NewsletterSection";
import { getCollectionsWithCounts } from "@/lib/db/repositories/collections";
import { getProducts }              from "@/lib/db/repositories/products";
import { getSetting, getNumberSetting } from "@/lib/db/repositories/settings";
import { adaptCollection, adaptProduct, getMockTestimonials } from "@/lib/adapters";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [dbCollections, dbNewArrivals, dbBestSellers, heroBannersRaw, heroRotation] = await Promise.all([
    getCollectionsWithCounts(),
    getProducts({ isNew:        true, limit: 8, sortBy: "newest" }),
    getProducts({ isBestSeller: true, limit: 8, sortBy: "bestselling" }),
    getSetting("hero_banners"),
    getNumberSetting("hero_rotation_seconds", 8),
  ]);

  const collections  = dbCollections.map(adaptCollection);
  const newArrivals  = dbNewArrivals.map(adaptProduct);
  const bestSellers  = dbBestSellers.map(adaptProduct);
  const testimonials = getMockTestimonials();

  let heroBanners: unknown[] = [];
  if (heroBannersRaw) {
    try {
      const all: unknown[] = JSON.parse(heroBannersRaw);
      heroBanners = all
        .filter((b): b is { isActive: boolean } => typeof b === "object" && b !== null && (b as { isActive?: boolean }).isActive === true)
        .sort((a, b) => (a as { sortOrder: number }).sortOrder - (b as { sortOrder: number }).sortOrder);
    } catch { heroBanners = []; }
  }

  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <HeroSection banners={heroBanners as any} rotationSeconds={heroRotation} />
      <FeaturedCollections collections={collections} />
      <NewArrivals newArrivals={newArrivals} bestSellers={bestSellers} />
      <BrandStory />
      <Testimonials testimonials={testimonials} />
      <GallerySection />
      <NewsletterSection />
    </>
  );
}