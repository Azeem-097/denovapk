"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, User, MapPin } from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { shippingSchema, type ShippingFormData, PAKISTAN_PROVINCES } from "@/lib/validations";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useState } from "react";

interface ShippingFormProps {
  onNext: () => void;
}

export function ShippingForm({ onNext }: ShippingFormProps) {
  const { shippingData, setShippingData } = useCheckoutStore();
  const [checked, setChecked] = useState<boolean>(shippingData?.saveInfo ?? true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: shippingData || {
      email: "", phone: "",
      firstName: "", lastName: "",
      address: "", apartment: "",
      city: "", province: "", postalCode: "",
      notes: "",
      saveInfo: true,
    },
  });

  const onSubmit = (data: ShippingFormData) => {
    setShippingData({ ...data, saveInfo: checked });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* Contact section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-[#c9a96e]" />
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
            Contact Information
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email"
            required
            type="email"
            placeholder="your.email@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Phone"
            required
            type="tel"
            placeholder="+92 300 1234567"
            {...register("phone")}
            error={errors.phone?.message}
          />
        </div>
      </section>

      {/* Shipping Address */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={16} className="text-[#c9a96e]" />
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
            Shipping Address
          </h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              placeholder="John"
              {...register("firstName")}
              error={errors.firstName?.message}
            />
            <Input
              label="Last Name"
              required
              placeholder="Doe"
              {...register("lastName")}
              error={errors.lastName?.message}
            />
          </div>

          <Input
            label="Street Address"
            required
            placeholder="House #, Street name, Area"
            {...register("address")}
            error={errors.address?.message}
          />

          <Input
            label="Apartment, Suite, etc. (optional)"
            placeholder="Apartment 4B, Suite 200"
            {...register("apartment")}
            error={errors.apartment?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="City"
              required
              placeholder="Lahore"
              {...register("city")}
              error={errors.city?.message}
            />
            <Select
              label="Province"
              required
              options={[...PAKISTAN_PROVINCES]}
              {...register("province")}
              error={errors.province?.message}
            />
            <Input
              label="Postal Code"
              required
              placeholder="54000"
              {...register("postalCode")}
              error={errors.postalCode?.message}
            />
          </div>

          <Textarea
            label="Order Notes (optional)"
            placeholder="Any special instructions for delivery"
            rows={3}
            {...register("notes")}
            error={errors.notes?.message}
          />
        </div>
      </section>

      {/* Save info */}
      <label className="flex items-center gap-2.5 cursor-pointer group">
        <div
          onClick={() => setChecked(!checked)}
          className={`w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            checked
              ? "border-[#c9a96e] bg-[#c9a96e]"
              : "border-[#e5e7eb] group-hover:border-[#c9a96e]"
          }`}
        >
          {checked && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <span className="text-sm text-[#6b7280]">
          Save this information for next time
        </span>
      </label>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb]">
        <a
          href="/cart"
          className="text-sm text-[#6b7280] hover:text-[#1a1a1a] transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowRight size={14} className="rotate-180" />
          Back to cart
        </a>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#c9a96e] transition-colors disabled:opacity-60"
        >
          Continue to Shipping
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}