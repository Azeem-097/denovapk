import type { DbProduct, DbProductImage, DbProductVariant, DbCollection, DbOrder, DbOrderItem, DbUser } from "@/lib/db/types";
import type { ProductWithRelations } from "@/lib/db/repositories/products";
import type { AdminProduct, AdminOrder, AdminCustomer, AdminCollection, AdminOrderItem } from "@/types";
import { tagsToArray } from "@/lib/db/helpers";

// ─── Product ─────────────────────────────────────────────
export function adaptProduct(p: ProductWithRelations): AdminProduct {
  const primaryImg = p.images.find((i) => i.isPrimary === 1) || p.images[0];
  const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);

  return {
    id:           p.id,
    name:         p.name,
    slug:         p.slug,
    sku:          p.sku,
    status:       p.status.toLowerCase() as "published" | "draft" | "archived",
    price:        p.price / 100,
    comparePrice: p.comparePrice ? p.comparePrice / 100 : null,
    collection:   p.collection?.name ?? "",
    collectionId: p.collectionId ?? "",
    stock:        totalStock,
    sold:         p.soldCount,
    image:        primaryImg?.url ?? "",
    isNew:        p.isNew === 1,
    isFeatured:   p.isFeatured === 1,
    sortOrder:    p.sortOrder ?? 0,
    brand:        p.brand ?? null,
    createdAt:    new Date(p.createdAt * 1000).toISOString(),
    updatedAt:    new Date(p.updatedAt * 1000).toISOString(),
  };
}

// ─── Order ───────────────────────────────────────────────
export function adaptOrder(
  o: DbOrder & { items: DbOrderItem[]; address?: unknown },
  customerName  = "",
  customerEmail = "",
  customerPhone = ""
): AdminOrder {
  return {
    id:            o.id,
    orderNumber:   o.orderNumber,
    customer:      customerName || o.guestName || "Guest",
    customerEmail: customerEmail || o.guestEmail || "",
    customerPhone: customerPhone || o.guestPhone || "",
    items:         o.items.map(adaptOrderItem),
    status:        o.status.toLowerCase() as AdminOrder["status"],
    paymentStatus: o.paymentStatus.toLowerCase() as AdminOrder["paymentStatus"],
    paymentMethod: o.paymentMethod,
    subtotal:      o.subtotal / 100,
    discount:      o.discount / 100,
    shipping:      o.shipping / 100,
    total:         o.total / 100,
    city:          "",
    address:       "",
    notes:         o.customerNote ?? undefined,
    trackingNum:   o.trackingNumber ?? undefined,
    createdAt:     new Date(o.createdAt * 1000).toISOString(),
    updatedAt:     new Date(o.updatedAt * 1000).toISOString(),
  };
}

function adaptOrderItem(item: DbOrderItem): AdminOrderItem {
  return {
    id:        item.id,
    productId: item.productId,
    name:      item.name,
    image:     item.image,
    size:      item.size,
    color:     item.color,
    price:     item.price / 100,
    quantity:  item.quantity,
    sku:       item.sku,
  };
}

// ─── Customer ────────────────────────────────────────────
// FIX: Accept null OR undefined for optional fields (DB returns null, TS interfaces use undefined)
export function adaptCustomer(
  u: DbUser & {
    totalOrders?: number;
    totalSpent?:  number;
    lastOrder?:   string | null;
    city?:        string | null;
  }
): AdminCustomer {
  return {
    id:          u.id,
    name:        u.name,
    email:       u.email,
    phone:       u.phone ?? "",
    city:        u.city ?? "",
    totalOrders: u.totalOrders ?? 0,
    totalSpent:  (u.totalSpent ?? 0) / 100,
    lastOrder:   u.lastOrder ?? new Date(u.createdAt * 1000).toISOString(),
    isActive:    u.isActive === 1,
    joinedAt:    new Date(u.createdAt * 1000).toISOString(),
  };
}

// ─── Collection ──────────────────────────────────────────
export function adaptCollection(c: DbCollection & { productCount?: number }): AdminCollection {
  return {
    id:           c.id,
    name:         c.name,
    slug:         c.slug,
    description:  c.description,
    image:        c.image ?? "",
    productCount: c.productCount ?? 0,
    isActive:     c.isActive === 1,
    createdAt:    new Date(c.createdAt * 1000).toISOString(),
  };
}

// Silence unused
void tagsToArray;
