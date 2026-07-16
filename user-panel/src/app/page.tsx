import { HeroSection }          from "@/components/sections/HeroSection";
import { FeaturedCollections }  from "@/components/sections/FeaturedCollections";
import { NewArrivals }          from "@/components/sections/NewArrivals";
import { BrandStory }           from "@/components/sections/BrandStory";
import { Testimonials }         from "@/components/sections/Testimonials";
import { GallerySection }       from "@/components/sections/GallerySection";
import { NewsletterSection }    from "@/components/sections/NewsletterSection";
import { getCollectionsWithCounts } from "@/lib/db/repositories/collections";
import { getProducts }              from "@/lib/db/repositories/products";
import { getSetting }               from "@/lib/db/repositories/settings";
import { adaptCollection, adaptProduct, getMockTestimonials } from "@/lib/adapters";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [dbCollections, dbNewArrivals, dbBestSellers, heroBannersRaw] = await Promise.all([
    getCollectionsWithCounts(),
    getProducts({ isNew:        true, limit: 8, sortBy: "newest" }),
    getProducts({ isBestSeller: true, limit: 8, sortBy: "bestselling" }),
    getSetting("hero_banners"),
  ]);

  const collections  = dbCollections.map(adaptCollection);
  const newArrivals  = dbNewArrivals.map(adaptProduct);
  const bestSellers  = dbBestSellers.map(adaptProduct);
  const testimonials = getMockTestimonials();

  let heroBanners: HeroBanner[] = [];
  if (heroBannersRaw) {
    try {
      const all: HeroBanner[] = JSON.parse(heroBannersRaw);
      heroBanners = all
        .filter((b) => b.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    } catch {
      heroBanners = [];
    }
  }

  return (
    <>
      <HeroSection banners={heroBanners} />
      <FeaturedCollections collections={collections} />
      <NewArrivals newArrivals={newArrivals} bestSellers={bestSellers} />
      <BrandStory />
      <Testimonials testimonials={testimonials} />
      <GallerySection />
      <NewsletterSection />
    </>
  );
}

interface HeroBanner {
  id:                   string;
  image:                string;
  imageMobile?:         string;
  title:                string;
  subtitle:             string;
  description:          string;
  buttonLabel:          string;
  buttonHref:           string;
  buttonSecondaryLabel: string;
  buttonSecondaryHref:  string;
  isActive:             boolean;
  sortOrder:            number;
}