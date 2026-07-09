"use client";
import { create } from "zustand";
import type { ShippingFormData } from "@/lib/validations";

export interface ShippingMethod {
  id:      string;
  name:    string;
  time:    string;
  price:   number;
}

export type PaymentMethod = "cod" | "card" | "jazzcash" | "easypaisa" | "bank";

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "standard", name: "Standard Delivery",    time: "3-5 business days", price: 250 },
  { id: "express",  name: "Express Delivery",     time: "1-2 business days", price: 500 },
  { id: "sameday",  name: "Same Day (Lahore)",    time: "Within 24 hours",   price: 800 },
];

interface CheckoutState {
  currentStep:      number;
  shippingData:     ShippingFormData | null;
  shippingMethod:   ShippingMethod;
  paymentMethod:    PaymentMethod;
  orderNumber:      string | null;

  setStep:              (step: number) => void;
  setShippingData:      (data: ShippingFormData) => void;
  setShippingMethod:    (method: ShippingMethod) => void;
  setPaymentMethod:     (method: PaymentMethod) => void;
  setOrderNumber:       (num: string) => void;
  reset:                () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  currentStep:    1,
  shippingData:   null,
  shippingMethod: SHIPPING_METHODS[0],
  paymentMethod:  "cod",
  orderNumber:    null,

  setStep:              (currentStep)    => set({ currentStep }),
  setShippingData:      (shippingData)   => set({ shippingData }),
  setShippingMethod:    (shippingMethod) => set({ shippingMethod }),
  setPaymentMethod:     (paymentMethod)  => set({ paymentMethod }),
  setOrderNumber:       (orderNumber)    => set({ orderNumber }),

  reset: () => set({
    currentStep:    1,
    shippingData:   null,
    shippingMethod: SHIPPING_METHODS[0],
    paymentMethod:  "cod",
    orderNumber:    null,
  }),
}));