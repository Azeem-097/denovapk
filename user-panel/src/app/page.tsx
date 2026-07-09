import { HeroSection }        from "@/components/sections/HeroSection";
import { FeaturedCollections } from "@/components/sections/FeaturedCollections";
import { NewArrivals }         from "@/components/sections/NewArrivals";
import { BrandStory }          from "@/components/sections/BrandStory";
import { Testimonials }        from "@/components/sections/Testimonials";
import { GallerySection }      from "@/components/sections/GallerySection";
import { NewsletterSection }   from "@/components/sections/NewsletterSection";
import { getCollectionsWithCounts } from "@/lib/db/repositories/collections";
import { getProducts }              from "@/lib/db/repositories/products";
import { adaptCollection, adaptProduct, getMockTestimonials } from "@/lib/adapters";

// Force dynamic to always fetch fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  // Fetch data in parallel
  const [dbCollections, dbNewArrivals, dbBestSellers] = await Promise.all([
    getCollectionsWithCounts(),
    getProducts({ isNew:        true, limit: 8, sortBy: "newest" }),
    getProducts({ isBestSeller: true, limit: 8, sortBy: "bestselling" }),
  ]);

  const collections  = dbCollections.map(adaptCollection);
  const newArrivals  = dbNewArrivals.map(adaptProduct);
  const bestSellers  = dbBestSellers.map(adaptProduct);
  const testimonials = getMockTestimonials();

  return (
    <>
      <HeroSection />
      <FeaturedCollections collections={collections} />
      <NewArrivals newArrivals={newArrivals} bestSellers={bestSellers} />
      <BrandStory />
      <Testimonials testimonials={testimonials} />
      <GallerySection />
      <NewsletterSection />
    </>
  );
}