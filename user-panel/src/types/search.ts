export interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  imageAlt: string;
  collection: string;
  tags: string[];
  isBestSeller: boolean;
  isSoldOut: boolean;
  createdAt: string;
}
