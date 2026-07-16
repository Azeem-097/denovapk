"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, User, MapPin, CheckCircle } from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { shippingSchema, type ShippingFormData, PAKISTAN_PROVINCES } from "@/lib/validations";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

interface ShippingFormProps {
  onNext: () => void;
}

const EMPTY_DEFAULTS: ShippingFormData = {
  email: "", phone: "", firstName: "", lastName: "",
  address: "", apartment: "", city: "", province: "", postalCode: "",
  notes: "", saveInfo: true,
};

export function ShippingForm({ onNext }: ShippingFormProps) {
  const { shippingData, setShippingData } = useCheckoutStore();
  const items      = useCartStore((s) => s.items);
  const user       = useAuthStore((s) => s.user);
  const addresses  = useAuthStore((s) => s.addresses);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const [checked, setChecked]             = useState<boolean>(shippingData?.saveInfo ?? true);
  const [prefilledFrom, setPrefilledFrom] = useState<"checkout" | "profile" | "none">("none");
  const [mounted, setMounted]             = useState(false);

  const getInitialValues = (): ShippingFormData => {
    // Priority 1: Data already entered during this checkout session
    if (shippingData) return shippingData;

    // Priority 2: Logged in — use DEFAULT ADDRESS data (not user profile name!)
    if (isLoggedIn && user) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

      if (defaultAddr) {
        // ── Use the ADDRESS fullName (not the user account name) ──
        const nameParts = (defaultAddr.fullName || "").trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName  = nameParts.slice(1).join(" ") || "";

        return {
          email:      user.email || "",
          phone:      defaultAddr.phone || user.phone || "",
          firstName,
          lastName,
          address:    defaultAddr.street || "",
          apartment:  defaultAddr.apartment || "",
          city:       defaultAddr.city || "",
          province:   defaultAddr.province?.toLowerCase() || "",
          postalCode: defaultAddr.postalCode || "",
          notes:      "",
          saveInfo:   true,
        };
      }

      // User is logged in but has NO saved address — use account name/email only
      const nameParts = (user.name || "").trim().split(/\s+/);
      return {
        email:      user.email || "",
        phone:      user.phone || "",
        firstName:  nameParts[0] || "",
        lastName:   nameParts.slice(1).join(" ") || "",
        address:    "",
        apartment:  "",
        city:       "",
        province:   "",
        postalCode: "",
        notes:      "",
        saveInfo:   true,
      };
    }

    // Priority 3: Empty for guests
    return EMPTY_DEFAULTS;
  };

  const {
    register, handleSubmit, getValues, reset,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;

    const initialValues = getInitialValues();
    reset(initialValues);

    if (shippingData) {
      setPrefilledFrom("checkout");
    } else if (isLoggedIn && user && addresses.length > 0) {
      setPrefilledFrom("profile");
    } else if (isLoggedIn && user) {
      setPrefilledFrom("none");
    } else {
      setPrefilledFrom("none");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isLoggedIn, user?.id, addresses.length, shippingData]);

  const trackCheckoutAbandonment = () => {
    const data = getValues();
    if (!data.phone && !data.email) return;
    if (items.length === 0) return;

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    fetch("/api/abandoned-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items, subtotal,
        checkoutData: {
          email:    data.email,
          phone:    data.phone,
          fullName: `${data.firstName} ${data.lastName}`.trim(),
          city:     data.city,
        },
      }),
      keepalive: true,
    }).catch(() => {});
  };

  const onSubmit = (data: ShippingFormData) => {
    setShippingData({ ...data, saveInfo: checked });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {prefilledFrom === "profile" && (
        <div className="border border-[#c9a96e]/30 bg-[#f5f0e8]/50 p-4 flex items-start gap-3">
          <CheckCircle size={16} className="text-[#c9a96e] flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-semibold text-[#1a1a1a]">
              Pre-filled from your saved address
            </p>
            <p className="text-[#6b7280] mt-0.5">
              Feel free to update any details below before placing your order.
            </p>
          </div>
        </div>
      )}

      {prefilledFrom === "none" && isLoggedIn && (
        <div className="border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
          <User size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-semibold text-blue-900">Complete your delivery info below</p>
            <p className="text-blue-700 mt-0.5">Your details will be saved for faster checkout next time.</p>
          </div>
        </div>
      )}

      {/* Contact */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-[#c9a96e]" />
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">Contact Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Email" required type="email" placeholder="your.email@example.com"
            {...register("email", { onBlur: trackCheckoutAbandonment })}
            error={errors.email?.message} />
          <Input label="Phone" required type="tel" placeholder="+92 300 1234567"
            {...register("phone", { onBlur: trackCheckoutAbandonment })}
            error={errors.phone?.message} />
        </div>
      </section>

      {/* Address */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={16} className="text-[#c9a96e]" />
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">Shipping Address</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First Name" required placeholder="John"
              {...register("firstName", { onBlur: trackCheckoutAbandonment })}
              error={errors.firstName?.message} />
            <Input label="Last Name" required placeholder="Doe"
              {...register("lastName", { onBlur: trackCheckoutAbandonment })}
              error={errors.lastName?.message} />
          </div>

          <Input label="Street Address" required placeholder="House #, Street name, Area"
            {...register("address")} error={errors.address?.message} />

          <Input label="Apartment, Suite, etc. (optional)" placeholder="Apartment 4B, Suite 200"
            {...register("apartment")} error={errors.apartment?.message} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="City" required placeholder="Lahore"
              {...register("city", { onBlur: trackCheckoutAbandonment })}
              error={errors.city?.message} />
            <Select label="Province" required options={[...PAKISTAN_PROVINCES]}
              {...register("province")} error={errors.province?.message} />
            <Input label="Postal Code" required placeholder="54000"
              {...register("postalCode")} error={errors.postalCode?.message} />
          </div>

          <Textarea label="Order Notes (optional)" placeholder="Any special instructions for delivery"
            rows={3} {...register("notes")} error={errors.notes?.message} />
        </div>
      </section>

      {isLoggedIn && (
        <label className="flex items-start gap-2.5 cursor-pointer group border border-[#e5e7eb] bg-[#fafaf9] p-4">
          <div onClick={() => setChecked(!checked)}
            className={`mt-0.5 w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              checked ? "border-[#c9a96e] bg-[#c9a96e]" : "border-[#e5e7eb] group-hover:border-[#c9a96e]"
            }`}>
            {checked && (
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-[#1a1a1a] block">Save this address to my account</span>
            <span className="text-xs text-[#6b7280] mt-0.5 block">
              {prefilledFrom === "profile"
                ? "We'll update your saved address if you made changes"
                : "Faster checkout next time - your info will be pre-filled"}
            </span>
          </div>
        </label>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb]">
        <a href="/cart" className="text-sm text-[#6b7280] hover:text-[#1a1a1a] transition-colors inline-flex items-center gap-1.5">
          <ArrowRight size={14} className="rotate-180" />
          Back to cart
        </a>

        <button type="submit" disabled={isSubmitting}
          className="group inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#c9a96e] transition-colors disabled:opacity-60">
          Continue to Shipping
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}