"use client";
import { create } from "zustand";
import type { ShippingFormData } from "@/lib/validations";

export interface ShippingMethod {
  id: string; name: string; time: string; price: number;
}

export type PaymentMethod = "cod" | "card" | "jazzcash" | "easypaisa" | "bank";

// Default shipping method (updated dynamically from admin settings)
export const DEFAULT_SHIPPING_METHOD: ShippingMethod = {
  id:    "free",
  name:  "Free Delivery",
  time:  "Free delivery across Pakistan",
  price: 0,
};

interface CheckoutState {
  shippingData:       ShippingFormData | null;
  shippingMethod:     ShippingMethod;
  paymentMethod:      PaymentMethod;
  orderNumber:        string | null;

  loyaltyPointsUsed:  number;
  loyaltyDiscount:    number;

  birthdayDiscount:   number;
  isBirthdayEligible: boolean;

  discountCode:       string;
  discountAmount:     number;

  setShippingData:       (data: ShippingFormData) => void;
  setShippingMethod:     (method: ShippingMethod) => void;
  setPaymentMethod:      (method: PaymentMethod) => void;
  setOrderNumber:        (num: string) => void;
  setLoyaltyRedemption:  (points: number, discount: number) => void;
  setBirthdayDiscount:   (discount: number, eligible: boolean) => void;
  setDiscountCode:       (code: string, amount: number) => void;
  clearDiscountCode:     () => void;
  reset:                 () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  shippingData:       null,
  shippingMethod:     DEFAULT_SHIPPING_METHOD,
  paymentMethod:      "cod",
  orderNumber:        null,
  loyaltyPointsUsed:  0,
  loyaltyDiscount:    0,
  birthdayDiscount:   0,
  isBirthdayEligible: false,
  discountCode:       "",
  discountAmount:     0,

  setShippingData:      (shippingData)   => set({ shippingData }),
  setShippingMethod:    (shippingMethod) => set({ shippingMethod }),
  setPaymentMethod:     (paymentMethod)  => set({ paymentMethod }),
  setOrderNumber:       (orderNumber)    => set({ orderNumber }),
  setLoyaltyRedemption: (points, discount) => set({
    loyaltyPointsUsed: points, loyaltyDiscount: discount,
  }),
  setBirthdayDiscount:  (discount, eligible) => set({
    birthdayDiscount: discount, isBirthdayEligible: eligible,
  }),
  setDiscountCode:      (discountCode, discountAmount) => set({
    discountCode, discountAmount,
  }),
  clearDiscountCode:    () => set({
    discountCode: "", discountAmount: 0,
  }),

  reset: () => set({
    shippingData: null,
    shippingMethod: DEFAULT_SHIPPING_METHOD, paymentMethod: "cod",
    orderNumber: null,
    loyaltyPointsUsed: 0, loyaltyDiscount: 0,
    birthdayDiscount: 0, isBirthdayEligible: false,
    discountCode: "", discountAmount: 0,
  }),
}));

// Kept for backward compatibility with any existing imports
export const SHIPPING_METHODS = [DEFAULT_SHIPPING_METHOD];
