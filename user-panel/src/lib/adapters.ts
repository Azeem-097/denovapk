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
    id:             p.id,
    name:           p.name,
    slug:           p.slug,
    description:    p.description,
    price:          p.price / 100,
    compareAtPrice: p.comparePrice ? p.comparePrice / 100 : undefined,
    images:         p.images.map(adaptImage),
    variants:       p.variants.map(adaptVariant),
    collectionId:   p.collectionId ?? "",
    collection:     p.collection?.name ?? "",
    tags:           tagsToArray(p.tags),
    isNew:          p.isNew === 1,
    isFeatured:     p.isFeatured === 1,
    isBestSeller:   p.isBestSeller === 1,
    rating:         p.rating,
    reviewCount:    p.reviewCount,
    waist:          p.waist  ?? null,
    length:         p.length ?? null,
    bottom:         p.bottom ?? null,
    bgColor:        p.bgColor ?? null,
    brand:          p.brand ?? null,
    createdAt:      new Date(p.createdAt * 1000).toISOString(),
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
export function adaptCollection(
  c: DbCollection & { productCount?: number; minPrice?: number | null; maxPrice?: number | null }
): Collection {
  return {
    id:           c.id,
    name:         c.name,
    slug:         c.slug,
    description:  c.description,
    image:        c.image ?? "",
    productCount: c.productCount ?? 0,
    minPrice:     c.minPrice != null ? c.minPrice / 100 : undefined,
    maxPrice:     c.maxPrice != null ? c.maxPrice / 100 : undefined,
  };
}

// ─── Testimonials (denim-focused, brand-relevant) ────────
export function getMockTestimonials(): Testimonial[] {
  return [
    {
      id:       "t-1",
      name:     "Ahmed Raza",
      location: "Lahore",
      rating:   5,
      comment:  "Best denim I've owned. The fit is spot on, the fabric feels heavy and premium — you can tell it's export quality. Wore them for weeks straight and the colour hasn't faded a bit.",
      date:     "2024-06-12",
    },
    {
      id:       "t-2",
      name:     "Usman Tariq",
      location: "Karachi",
      rating:   5,
      comment:  "Finally jeans that fit Pakistani body types properly. Bought the mid-blue enzyme wash — the wash is beautiful and the stitching is on another level. Worth every rupee.",
      date:     "2024-06-02",
    },
    {
      id:       "t-3",
      name:     "Bilal Ahmed",
      location: "Islamabad",
      rating:   5,
      comment:  "I've been buying imported jeans for years. Denova PK matches that quality at half the price. The Super Premium range especially — feels like a proper Japanese denim experience.",
      date:     "2024-06-18",
    },
    {
      id:       "t-4",
      name:     "Hamza Sheikh",
      location: "Rawalpindi",
      rating:   5,
      comment:  "Ordered the black tapered fit and grey cargo pants. Delivery was fast, packaging was premium, and both pieces fit exactly as described. Denim quality is top-tier.",
      date:     "2024-05-28",
    },
    {
      id:       "t-5",
      name:     "Zain Ali",
      location: "Faisalabad",
      rating:   5,
      comment:  "Was skeptical about buying jeans online but Denova PK nailed it. Size guide is accurate, fabric is comfortable, and the loose-fit denim is exactly what I was looking for. Ordering another pair.",
      date:     "2024-05-15",
    },
    {
      id:       "t-6",
      name:     "Faisal Khan",
      location: "Lahore",
      rating:   5,
      comment:  "The garment-dyed cargo is unreal. Fits perfectly, colour is rich, and the pockets are actually functional. Denova is doing what no other Pakistani denim brand is doing right now.",
      date:     "2024-04-30",
    },
  ];
}