import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/repositories/products";
import { adaptProduct } from "@/lib/adapters";
import { ProductDetailClient } from "./ProductDetailClient";

// ISR: 60s cache. Stock levels update within 1 minute for browsing users.
// (Real stock validation happens at checkout — this is safe.)
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

// Placeholder image shown when a product has no images uploaded yet
const PLACEHOLDER_IMAGE = {
  id:        "placeholder",
  url:       "/uploads/placeholder.svg",
  alt:       "Product image coming soon",
  isPrimary: true,
};

const SITE_URL = "https://denovapk.com";
const SITE_NAME = "Denova PK";

function absoluteUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function plainText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "PUBLISHED") {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description = product.metaDescription || product.shortDescription || plainText(product.description).slice(0, 155);
  const title = product.metaTitle || product.name;
  const primaryImage = product.images.find((image) => image.isPrimary === 1) || product.images[0];
  const imageUrl = primaryImage ? absoluteUrl(primaryImage.url) : `${SITE_URL}/og-image.jpg`;
  const productUrl = `${SITE_URL}/products/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: productUrl },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: productUrl,
      images: [{ url: imageUrl, alt: primaryImage?.alt || product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let dbProduct;
  try {
    dbProduct = await getProductBySlug(slug);
  } catch (err) {
    console.error("Failed to load product:", err);
    notFound();
  }

  if (!dbProduct) notFound();

  const product = adaptProduct(dbProduct);

  // Ensure we always have at least one image so the UI never crashes
  if (product.images.length === 0) {
    product.images = [PLACEHOLDER_IMAGE];
  }

  let relatedProducts: ReturnType<typeof adaptProduct>[] = [];
  try {
    if (dbProduct.collectionId) {
      const dbRelated = await getRelatedProducts(dbProduct.id, dbProduct.collectionId, 4);
      relatedProducts = dbRelated.map((p) => {
        const adapted = adaptProduct({ ...p, collection: dbProduct.collection });
        if (adapted.images.length === 0) adapted.images = [PLACEHOLDER_IMAGE];
        return adapted;
      });
    }
  } catch (err) {
    console.error("Failed to load related products:", err);
  }

  const primaryImage = product.images.find((image) => image.isPrimary) || product.images[0];
  const totalStock = product.variants.reduce((sum, variant) => sum + Math.max(0, variant.stock), 0);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: plainText(product.description),
    sku: product.sku || product.variants[0]?.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "Denova PK",
    },
    image: product.images.map((image) => absoluteUrl(image.url)),
    url: `${SITE_URL}/products/${product.slug}`,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: "PKR",
      price: product.price,
      availability: totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.reviewCount > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      },
    } : {}),
  };

  if (product.images.length === 1 && primaryImage.id === PLACEHOLDER_IMAGE.id) {
    schema.image = [`${SITE_URL}/og-image.jpg`];
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
