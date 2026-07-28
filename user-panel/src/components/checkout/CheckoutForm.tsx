"use client";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard, Truck, Building2, Smartphone, Wallet, ArrowLeft, AlertCircle,
} from "lucide-react";
import {
  FloatingInput, FloatingTextarea, FloatingSelect, FloatingLockedField,
} from "@/components/ui/FloatingInput";
import { shippingSchema, type ShippingFormData, PAKISTAN_PROVINCES } from "@/lib/validations";
import { useCheckoutStore, type PaymentMethod } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useShippingConfigStore } from "@/store/shippingConfigStore";
import { usePaymentConfigStore } from "@/store/paymentConfigStore";
import { useToastStore } from "@/store/toastStore";
import { trackMetaEvent, trackMetaCustomEvent } from "@/lib/metaPixel";
import { formatPrice, cn } from "@/lib/utils";

const EMPTY_DEFAULTS: ShippingFormData = {
  phone: "", fullName: "",
  address: "", city: "", province: "", postalCode: "",
  notes: "", saveInfo: true,
};

// Master list — each mapped to its config key
const ALL_PAYMENT_OPTIONS = [
  { id: "cod",       configKey: "cod",       label: "Cash on Delivery",     desc: "Pay when you receive your order",     icon: Truck },
  { id: "card",      configKey: "card",      label: "Credit / Debit Card",  desc: "Visa, Mastercard, and more",           icon: CreditCard },
  { id: "jazzcash",  configKey: "jazzcash",  label: "JazzCash",             desc: "Pay via JazzCash mobile wallet",       icon: Smartphone },
  { id: "easypaisa", configKey: "easypaisa", label: "Easypaisa",            desc: "Pay via Easypaisa mobile wallet",      icon: Wallet },
  { id: "bank",      configKey: "bank",      label: "Bank Transfer",        desc: "Direct bank transfer to our account",  icon: Building2 },
] as const;

export function CheckoutForm() {
  const router = useRouter();

  const {
    setShippingData, shippingData,
    paymentMethod, setPaymentMethod, setShippingMethod,
    loyaltyPointsUsed, loyaltyDiscount,
    birthdayDiscount, discountAmount,
    setOrderNumber, discountCode,
  } = useCheckoutStore();

  const items      = useCartStore((s) => s.items);
  const clearCart  = useCartStore((s) => s.clearCart);
  const subtotal   = useCartStore((s) => s.getSubtotal());

  const user       = useAuthStore((s) => s.user);
  const addresses  = useAuthStore((s) => s.addresses);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  // Shipping config
  const freeDeliveryAll = useShippingConfigStore((s) => s.config.freeDeliveryAll);
  const baseCost        = useShippingConfigStore((s) => s.config.baseCost);
  const threshold       = useShippingConfigStore((s) => s.config.threshold);
  const codFee          = useShippingConfigStore((s) => s.config.codFee);
  const loadShipConfig  = useShippingConfigStore((s) => s.loadConfig);

  // Payment config — SUBSCRIBE TO PRIMITIVES for reactive updates
  const codEnabled       = usePaymentConfigStore((s) => s.config.cod);
  const cardEnabled      = usePaymentConfigStore((s) => s.config.card);
  const jazzcashEnabled  = usePaymentConfigStore((s) => s.config.jazzcash);
  const easypaisaEnabled = usePaymentConfigStore((s) => s.config.easypaisa);
  const bankEnabled      = usePaymentConfigStore((s) => s.config.bank);
  const loadPayConfig    = usePaymentConfigStore((s) => s.loadConfig);

  const showToast = useToastStore((s) => s.addToast);

  const [mounted, setMounted]   = useState(false);
  const [saveInfo, setSaveInfo] = useState<boolean>(shippingData?.saveInfo ?? true);
  const [placing, setPlacing]   = useState(false);
  const [agreed, setAgreed]     = useState(true);

  const getInitialValues = (): ShippingFormData => {
    if (shippingData) return shippingData;

    if (isLoggedIn && user) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

      if (defaultAddr) {
        return {
          phone:      defaultAddr.phone || user.phone || "",
          fullName:   defaultAddr.fullName || user.name || "",
          address:    defaultAddr.street || "",
          city:       defaultAddr.city || "",
          province:   defaultAddr.province?.toLowerCase() || "",
          postalCode: defaultAddr.postalCode || "",
          notes:      "",
          saveInfo:   true,
        };
      }

      return {
        phone: user.phone || "",
        fullName: user.name || "",
        address: "", city: "", province: "",
        postalCode: "", notes: "", saveInfo: true,
      };
    }

    return EMPTY_DEFAULTS;
  };

  const {
    register, handleSubmit, getValues, reset, watch,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: EMPTY_DEFAULTS,
    mode: "onBlur",
  });

  const watchedPhone     = watch("phone");
  const watchedFullName  = watch("fullName");

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { loadShipConfig(); }, [loadShipConfig]);
  useEffect(() => { loadPayConfig();  }, [loadPayConfig]);

  useEffect(() => {
    if (!mounted) return;

    const updateMetaMatching = async () => {
      const data = await buildMetaAdvancedMatching({
        phone: watchedPhone,
        fullName: watchedFullName,
      });

      if (Object.keys(data).length === 0) return;
      const metaWindow = window as typeof window & {
        fbq?: (...args: unknown[]) => void;
        __DENOVA_META_PIXEL_ID?: string;
      };
      if (!metaWindow.fbq || !metaWindow.__DENOVA_META_PIXEL_ID) return;
      metaWindow.fbq("init", metaWindow.__DENOVA_META_PIXEL_ID, data);
    };

    const timer = window.setTimeout(() => {
      updateMetaMatching().catch(() => {});
    }, 600);

    return () => window.clearTimeout(timer);
  }, [mounted, watchedPhone, watchedFullName]);

  useEffect(() => {
    if (!mounted) return;
    reset(getInitialValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isLoggedIn, user?.id, addresses.length]);

  // ─── Filter payment options by admin config ─────────
  const paymentOptions = useMemo(() => {
    return ALL_PAYMENT_OPTIONS.filter((opt) => {
      switch (opt.configKey) {
        case "cod":       return codEnabled;
        case "card":      return cardEnabled;
        case "jazzcash":  return jazzcashEnabled;
        case "easypaisa": return easypaisaEnabled;
        case "bank":      return bankEnabled;
        default:          return true;
      }
    });
  }, [codEnabled, cardEnabled, jazzcashEnabled, easypaisaEnabled, bankEnabled]);

  // Auto-switch if selected method becomes disabled
  useEffect(() => {
    if (paymentOptions.length === 0) return;

    const stillAvailable = paymentOptions.some((opt) => opt.id === paymentMethod);
    if (!stillAvailable) {
      setPaymentMethod(paymentOptions[0].id as PaymentMethod);
    }
  }, [paymentOptions, paymentMethod, setPaymentMethod]);

  // ─── Live shipping cost ─────────────────────────────
  const shippingCost = useMemo(() => {
    if (subtotal <= 0) return 0;
    let s = 0;
    if (freeDeliveryAll) s = 0;
    else if (threshold > 0 && subtotal >= threshold) s = 0;
    else s = baseCost;
    if (paymentMethod === "cod" && codEnabled && codFee > 0) s += codFee;
    return s;
  }, [subtotal, freeDeliveryAll, threshold, baseCost, paymentMethod, codEnabled, codFee]);

  useEffect(() => {
    const time = freeDeliveryAll
      ? "Free delivery on every order across Pakistan"
      : (shippingCost === 0 && subtotal > 0)
        ? "Free shipping — 3-5 business days"
        : "3-5 business days across Pakistan";
    setShippingMethod({ id: "standard", name: "Standard Delivery", time, price: shippingCost });
  }, [shippingCost, freeDeliveryAll, subtotal, setShippingMethod]);

  const trackCheckoutAbandonment = () => {
    const data = getValues();
    if (!data.phone) return;
    if (items.length === 0) return;

    fetch("/api/abandoned-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items, subtotal,
        checkoutData: {
          phone:    data.phone,
          fullName: data.fullName,
          city:     data.city,
        },
      }),
      keepalive: true,
    }).catch(() => {});
  };

  const onSubmit = async (data: ShippingFormData) => {
    if (!agreed) {
      showToast({ type: "error", message: "Please agree to the terms & conditions." });
      return;
    }

    if (paymentOptions.length === 0) {
      showToast({ type: "error", message: "No payment methods are currently available. Please contact support." });
      return;
    }

    setPlacing(true);
    const payload = { ...data, saveInfo };
    setShippingData(payload);

    trackMetaEvent("AddPaymentInfo", {
      value: subtotal + shippingCost,
      currency: "PKR",
    });

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping: payload,
          shippingMethod: {
            id: "standard",
            name: "Standard Delivery",
            time: freeDeliveryAll
              ? "Free delivery on every order across Pakistan"
              : "3-5 business days across Pakistan",
            price: shippingCost,
          },
          paymentMethod,
          items: items.map((i) => ({
            productId: i.productId, variantId: i.variantId,
            name: i.name, image: i.image,
            size: i.size, color: i.color,
            price: i.price, quantity: i.quantity,
          })),
          saveAddress: saveInfo,
          discountCode: discountCode || undefined,
          loyaltyPointsToUse: loyaltyPointsUsed,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        showToast({ type: "error", message: result.error || "Order failed" });
        setPlacing(false);
        return;
      }

      setOrderNumber(result.orderNumber);

      trackMetaEvent("Purchase", {
        value: Math.max(0, subtotal + shippingCost - loyaltyDiscount - birthdayDiscount - discountAmount),
        currency: "PKR",
        content_ids: items.map((item) => item.variantId || item.productId),
        content_type: "product",
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      });

      if (birthdayDiscount > 0) {
        trackMetaCustomEvent("BirthdayDiscount", { value: birthdayDiscount });
      }

      await clearCart();

      let successMsg = "Order placed successfully!";
      if (result.isBirthdayOrder) successMsg = "🎂 Happy Birthday! Your special discount was applied. Order placed!";
      if (result.pointsEarned > 0) successMsg += ` You earned ${result.pointsEarned} loyalty points! 🎁`;
      showToast({ type: "success", message: successMsg, duration: 5000 });

      router.push("/checkout/confirmation");
    } catch (err) {
      console.error(err);
      showToast({ type: "error", message: "Network error. Please try again." });
      setPlacing(false);
    }
  };

  const codFeeVisible = codEnabled && codFee > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

      {/* ─── GUEST PROMOTIONAL BANNER ─────────────────────
          Encourages non-logged-in visitors to create an account
          to join loyalty program and get discounts. */}
      {mounted && !isLoggedIn && (
        <div className="relative overflow-hidden rounded-md border border-[#E10600]/30 bg-gradient-to-br from-[#f5f0e8] via-white to-[#faf7f2] p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#E10600]/15 border border-[#E10600]/30 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 15l-2 5l9-9l-9-9l2 5l-7 4z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#E10600] mb-1">
                Members-Only Rewards
              </p>
              <p className="text-sm text-[#1a1a1a] leading-snug">
                Create your account to enroll in our <span className="font-semibold">Loyalty Program</span> and enjoy exclusive discounts on upcoming orders.
              </p>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <Link
                  href={`/account/register?redirect=${encodeURIComponent("/checkout")}`}
                  className="inline-flex items-center gap-1.5 bg-[#1a1a1a] text-white text-xs font-semibold tracking-wide uppercase px-4 py-2 rounded hover:bg-[#E10600] transition-colors duration-200"
                >
                  Create Account
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href={`/account/login?redirect=${encodeURIComponent("/checkout")}`}
                  className="text-xs text-[#6b7280] hover:text-[#1a1a1a] underline underline-offset-4 decoration-[#d1d5db] hover:decoration-[#E10600] transition-colors"
                >
                  Already a member? Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT */}
      <section>
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-xl font-semibold text-[#1a1a1a]">Contact</h2>

          {mounted && !isLoggedIn && (
            <Link
              href={`/account/login?redirect=${encodeURIComponent("/checkout")}`}
              className="text-xs text-[#6b7280] hover:text-[#E10600] underline underline-offset-4 decoration-[#d1d5db] hover:decoration-[#E10600] transition-colors"
            >
              Sign in
            </Link>
          )}

          {mounted && isLoggedIn && user?.email && (
            <span className="text-xs text-[#6b7280]">
              Signed in as <span className="text-[#1a1a1a]">{user.email}</span>
            </span>
          )}
        </div>

        <div className="space-y-3">
          <FloatingInput label="Phone" type="tel" required
            {...register("phone", { onBlur: trackCheckoutAbandonment })}
            error={errors.phone?.message} />
        </div>
      </section>

      {/* DELIVERY */}
      <section>
        <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">Delivery</h2>

        <div className="space-y-3">
          <FloatingLockedField label="Country / Region" value="Pakistan" />

          <FloatingInput label="Full name" required
            {...register("fullName", { onBlur: trackCheckoutAbandonment })}
            error={errors.fullName?.message} />

          <FloatingInput label="Address" required {...register("address")} error={errors.address?.message} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FloatingInput label="City" required
              {...register("city", { onBlur: trackCheckoutAbandonment })}
              error={errors.city?.message} />
            <FloatingSelect label="Province" required
              options={[...PAKISTAN_PROVINCES]}
              {...register("province")}
              error={errors.province?.message} />
            <FloatingInput label="Postal code" required
              {...register("postalCode")}
              error={errors.postalCode?.message} />
          </div>

          <FloatingTextarea label="Order notes (optional)" rows={3}
            {...register("notes")} error={errors.notes?.message} />

          {isLoggedIn && (
            <label className="flex items-center gap-2.5 cursor-pointer group pt-1">
              <div onClick={() => setSaveInfo(!saveInfo)}
                className={cn(
                  "w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  saveInfo ? "border-[#1a1a1a] bg-[#1a1a1a]" : "border-[#d1d5db] group-hover:border-[#1a1a1a]"
                )}>
                {saveInfo && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-sm text-[#1a1a1a]">Save this information for next time</span>
            </label>
          )}
        </div>
      </section>

      {/* SHIPPING METHOD */}
      <section>
        <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">Shipping method</h2>

        <div className="rounded-md border-2 border-[#1a1a1a] bg-[#fafaf9] p-4 flex items-center gap-4">
          <div className="w-4 h-4 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1a1a1a]">Standard Delivery</p>
            <p className="text-xs text-[#6b7280] mt-0.5">
              {freeDeliveryAll
                ? "Free delivery on every order across Pakistan"
                : (shippingCost === 0
                    ? "Free shipping — 3-5 business days"
                    : "3-5 business days across Pakistan")}
            </p>
          </div>
          <p className="text-sm font-semibold text-[#1a1a1a]">
            {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
          </p>
        </div>

        {!freeDeliveryAll && threshold > 0 && subtotal < threshold && shippingCost > 0 && (
          <p className="mt-3 text-xs text-[#6b7280]">
            Add {formatPrice(threshold - subtotal)} more to qualify for free shipping.
          </p>
        )}
      </section>

      {/* PAYMENT */}
      <section>
        <h2 className="text-xl font-semibold text-[#1a1a1a] mb-1">Payment</h2>
        <p className="text-xs text-[#6b7280] mb-4">All transactions are secure and encrypted.</p>

        {paymentOptions.length === 0 ? (
          // Empty state — all payment methods disabled by admin
          <div className="rounded-md border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">No payment methods available</p>
              <p className="text-xs text-red-700 mt-1">
                We&apos;re temporarily unable to accept payments. Please contact support to complete your order.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-[#d1d5db] divide-y divide-[#d1d5db] overflow-hidden">
            {paymentOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = paymentMethod === opt.id;
              const showCodFee = opt.id === "cod" && codFeeVisible;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id as PaymentMethod)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 text-left transition-colors",
                    isSelected ? "bg-[#fafaf9]" : "bg-white hover:bg-[#fafaf9]"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    isSelected ? "border-[#1a1a1a]" : "border-[#d1d5db]"
                  )}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a]">
                      {opt.label}
                      {showCodFee && (
                        <span className="text-[#6b7280] font-normal">
                          {" "}(+{formatPrice(codFee)} handling fee)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[#6b7280] mt-0.5">{opt.desc}</p>
                  </div>
                  <Icon size={18} className="text-[#6b7280] flex-shrink-0" strokeWidth={1.5} />
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* TERMS + BUTTONS */}
      <section className="pt-2 space-y-4">
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <div onClick={() => setAgreed(!agreed)}
            className={cn(
              "mt-0.5 w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-all",
              agreed ? "border-[#1a1a1a] bg-[#1a1a1a]" : "border-[#d1d5db] group-hover:border-[#1a1a1a]"
            )}>
            {agreed && (
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-xs text-[#6b7280] leading-relaxed">
            I agree to the{" "}
            <Link href="/terms" className="text-[#E10600] underline underline-offset-2">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="text-[#E10600] underline underline-offset-2">Privacy Policy</Link>.
          </span>
        </label>

        <button
          type="submit"
          disabled={placing || !agreed || paymentOptions.length === 0}
          className={cn(
            "w-full h-12 rounded-md text-sm font-semibold transition-all duration-150",
            placing
              ? "bg-[#333] text-white"
              : (!agreed || paymentOptions.length === 0)
                ? "bg-[#e5e7eb] text-[#6b7280] cursor-not-allowed"
                : "bg-[#1a1a1a] text-white hover:bg-[#333] active:scale-[0.99]"
          )}
        >
          {placing ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Placing order...
            </span>
          ) : (
            "Complete order"
          )}
        </button>

        <Link
          href="/cart"
          className="w-full h-12 rounded-md border border-[#d1d5db] text-sm font-semibold text-[#1a1a1a] hover:border-[#1a1a1a] hover:bg-[#fafaf9] transition-all duration-150 inline-flex items-center justify-center gap-2 group"
        >
          <ArrowLeft size={16} strokeWidth={2}
            className="transition-transform duration-150 group-hover:-translate-x-1" />
          Return to cart
        </Link>
      </section>
    </form>
  );
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashMetaText(value: string | undefined): Promise<string | undefined> {
  const normalized = (value ?? "").trim().toLowerCase();
  return normalized ? sha256(normalized) : undefined;
}

async function hashMetaPhone(value: string | undefined): Promise<string | undefined> {
  const normalized = (value ?? "").replace(/\D/g, "");
  return normalized ? sha256(normalized) : undefined;
}

async function buildMetaAdvancedMatching(input: {
  phone?: string;
  fullName?: string;
}): Promise<Record<string, string>> {
  const [firstName = "", ...lastNameParts] = (input.fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const entries = await Promise.all([
    ["ph", await hashMetaPhone(input.phone)] as const,
    ["fn", await hashMetaText(firstName)] as const,
    ["ln", await hashMetaText(lastNameParts.join(" "))] as const,
  ]);

  return Object.fromEntries(entries.filter(([, value]) => !!value)) as Record<string, string>;
}
