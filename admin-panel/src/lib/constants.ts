export const ADMIN_SITE_NAME  = "Denova PK Admin";
export const BRAND_NAME       = "Denova PK";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
  refunded:   "Refunded",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed:  "bg-blue-100 text-blue-700 border-blue-200",
  processing: "bg-orange-100 text-orange-700 border-orange-200",
  shipped:    "bg-indigo-100 text-indigo-700 border-indigo-200",
  delivered:  "bg-green-100 text-green-700 border-green-200",
  cancelled:  "bg-red-100 text-red-700 border-red-200",
  refunded:   "bg-gray-100 text-gray-700 border-gray-200",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-700",
  paid:     "bg-green-100 text-green-700",
  failed:   "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

export const PRODUCT_STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft:     "bg-yellow-100 text-yellow-700",
  archived:  "bg-gray-100 text-gray-700",
};

export const ITEMS_PER_PAGE = 15;