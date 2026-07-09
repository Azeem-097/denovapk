/**
 * Adapters to convert database types (paisa, unix timestamps, 0/1 booleans)
 * to frontend types (rupees, dates, true/false).
 */

import type {
  DbProduct, DbProductImage, DbProductVariant, DbCollection,
} from "@/lib/db/types";
import type { ProductWithRelations } from "@/lib/db/repositories/products";
import type { Product, ProductImage, ProductVariant, Collection, Testimonial } from "@/types";
import { tagsToArray } from "@/lib/db/helpers";

// ─── Product ─────────────────────────────────────────────
export function adaptProduct(p: ProductWithRelations): Product {
  return {
    id:           p.id,
    name:         p.name,
    slug:         p.slug,
    description:  p.description,
    price:        p.price / 100, // paisa → rupees
    compareAtPrice: p.comparePrice ? p.comparePrice / 100 : undefined,
    images:       p.images.map(adaptImage),
    variants:     p.variants.map(adaptVariant),
    collectionId: p.collectionId ?? "",
    collection:   p.collection?.name ?? "",
    tags:         tagsToArray(p.tags),
    isNew:        p.isNew === 1,
    isFeatured:   p.isFeatured === 1,
    isBestSeller: p.isBestSeller === 1,
    rating:       p.rating,
    reviewCount:  p.reviewCount,
    createdAt:    new Date(p.createdAt * 1000).toISOString(),
  };
}

function adaptImage(img: DbProductImage): ProductImage {
  return {
    id:        img.id,
    url:       img.url,
    alt:       img.alt,
    isPrimary: img.isPrimary === 1,
  };
}

function adaptVariant(v: DbProductVariant): ProductVariant {
  return {
    id:             v.id,
    size:           v.size,
    color:          v.color,
    colorHex:       v.colorHex,
    stock:          v.stock,
    price:          v.price / 100,
    compareAtPrice: v.compareAtPrice ? v.compareAtPrice / 100 : undefined,
    sku:            v.sku,
  };
}

// ─── Collection ──────────────────────────────────────────
export function adaptCollection(c: DbCollection & { productCount?: number }): Collection {
  return {
    id:           c.id,
    name:         c.name,
    slug:         c.slug,
    description:  c.description,
    image:        c.image ?? "",
    productCount: c.productCount ?? 0,
  };
}

// ─── Testimonials (still hard-coded for now) ─────────────
export function getMockTestimonials(): Testimonial[] {
  return [
    { id: "t-1", name: "Ayesha Mahmood",  location: "Lahore",     rating: 5, comment: "Denova PK has completely transformed my wardrobe. The quality is outstanding - every piece feels premium and the stitching is immaculate. Will never shop anywhere else.", date: "2024-05-15" },
    { id: "t-2", name: "Usman Tariq",     location: "Karachi",    rating: 5, comment: "Finally a Pakistani brand that truly delivers on its promise of quality. The Formal Edit collection is exceptional. Got so many compliments at the office.", date: "2024-06-02" },
    { id: "t-3", name: "Sana Rizvi",      location: "Islamabad",  rating: 5, comment: "The embroidered lawn suit is absolutely gorgeous. The fabric quality, the embroidery detail, the fit - everything is perfect. Packaging was also very elegant.", date: "2024-06-18" },
    { id: "t-4", name: "Bilal Ahmed",     location: "Rawalpindi", rating: 4, comment: "Very impressed with the cashmere roll-neck. It is exactly as described - incredibly soft and warm. Fast delivery too. Highly recommend.", date: "2024-04-30" },
    { id: "t-5", name: "Fatima Khan",     location: "Lahore",     rating: 5, comment: "I bought three pieces from the Summer Essentials collection and I love them all. The linen quality is top-notch. This is genuine luxury at a fair price.", date: "2024-05-28" },
  ];
}