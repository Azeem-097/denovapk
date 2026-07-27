export interface MetaWindow extends Window {
  fbq?: (...args: unknown[]) => void;
  __DENOVA_META_PIXEL_ID?: string;
}

export const META_EVENTS = {
  PageView: "PageView",
  ViewContent: "ViewContent",
  Search: "Search",
  AddToCart: "AddToCart",
  InitiateCheckout: "InitiateCheckout",
  AddPaymentInfo: "AddPaymentInfo",
  Purchase: "Purchase",
  AddToWishlist: "AddToWishlist",
  Contact: "Contact",
  Lead: "Lead",
  CompleteRegistration: "CompleteRegistration",
  Subscribe: "Subscribe",
  FindLocation: "FindLocation",
} as const;

export const META_CUSTOM_EVENTS = {
  ViewCategory: "ViewCategory",
  CouponApplied: "CouponApplied",
  LoyaltyRedeemed: "LoyaltyRedeemed",
  BirthdayDiscount: "BirthdayDiscount",
  ReviewSubmitted: "ReviewSubmitted",
  OrderCancelled: "OrderCancelled",
} as const;

export type MetaEventName = typeof META_EVENTS[keyof typeof META_EVENTS];
export type MetaCustomEventName = typeof META_CUSTOM_EVENTS[keyof typeof META_CUSTOM_EVENTS];

function getMetaWindow(): MetaWindow | null {
  if (typeof window === "undefined") return null;
  return window as MetaWindow;
}

export function trackMetaEvent(eventName: string, params?: Record<string, unknown>): void {
  const metaWindow = getMetaWindow();
  if (!metaWindow?.fbq) return;

  if (params && Object.keys(params).length > 0) {
    metaWindow.fbq("track", eventName, params);
    return;
  }

  metaWindow.fbq("track", eventName);
}

export function trackMetaCustomEvent(eventName: string, params?: Record<string, unknown>): void {
  const metaWindow = getMetaWindow();
  if (!metaWindow?.fbq) return;

  if (params && Object.keys(params).length > 0) {
    metaWindow.fbq("trackCustom", eventName, params);
    return;
  }

  metaWindow.fbq("trackCustom", eventName);
}

export function trackMetaStandardEvent(eventName: MetaEventName, params?: Record<string, unknown>): void {
  trackMetaEvent(eventName, params);
}

export function trackMetaNamedCustomEvent(eventName: MetaCustomEventName, params?: Record<string, unknown>): void {
  trackMetaCustomEvent(eventName, params);
}