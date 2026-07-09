import { type ClassValue, clsx } from "clsx";

// Merge class names safely
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format price in PKR
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Calculate discount percentage
export function getDiscountPercent(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

// Slugify a string
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

// Format date
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-PK", {
    year:  "numeric",
    month: "long",
    day:   "numeric",
  }).format(new Date(dateString));
}

// Generate star array for ratings
export function getStars(rating: number): boolean[] {
  return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
}