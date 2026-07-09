"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, MapPin, Edit2, Trash, Check, X, Star } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Input, Select } from "@/components/ui/Input";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { AccountSidebar, NotLoggedInState } from "@/components/account/AccountSidebar";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { addressSchema, type AddressFormData, PAKISTAN_PROVINCES } from "@/lib/validations";
import type { Address } from "@/types";

export default function AddressesPage() {
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const { isLoggedIn, addresses, addAddress, updateAddress, removeAddress, setDefaultAddress } = useAuthStore();
  const showToast = useToastStore((s) => s.addToast);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  if (!isLoggedIn) return <NotLoggedInState />;

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (addr: Address) => {
    setEditing(addr);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this address?")) {
      removeAddress(id);
      showToast({ type: "info", message: "Address deleted" });
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultAddress(id);
    showToast({ type: "success", message: "Default address updated" });
  };

  const handleSave = (data: AddressFormData) => {
    if (editing) {
      updateAddress(editing.id, data);
      showToast({ type: "success", message: "Address updated" });
    } else {
      addAddress(data);
      showToast({ type: "success", message: "Address added" });
    }
    setModalOpen(false);
  };

  return (
    <>
      <div className="pt-28 pb-8 sm:pt-32 sm:pb-10 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb
              items={[
                { label: "Home",    href: "/" },
                { label: "Account", href: "/account/dashboard" },
                { label: "Addresses" },
              ]}
              className="mb-4"
            />
          </FadeIn>
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <TextReveal as="h1">
                <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a]">
                  Address Book
                </span>
              </TextReveal>
              <FadeIn delay={100}>
                <p className="text-[#6b7280] text-sm mt-2">
                  Manage your shipping addresses
                </p>
              </FadeIn>
            </div>
            <FadeIn delay={150}>
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-3 text-sm font-semibold tracking-wide hover:bg-[#c9a96e] transition-colors"
              >
                <Plus size={16} />
                Add Address
              </button>
            </FadeIn>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
          <FadeIn><AccountSidebar /></FadeIn>

          <div>
            {addresses.length === 0 ? (
              <div className="bg-white border border-[#e5e7eb] p-10 text-center">
                <MapPin size={40} className="text-[#c9a96e] mx-auto mb-4" />
                <h3 className="text-base font-semibold text-[#1a1a1a] mb-1">
                  No addresses yet
                </h3>
                <p className="text-sm text-[#6b7280] mb-5">
                  Add your first shipping address for faster checkout.
                </p>
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 text-sm font-semibold hover:bg-[#c9a96e] transition-colors"
                >
                  <Plus size={14} />
                  Add Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr, i) => (
                  <FadeIn key={addr.id} delay={i * 60}>
                    <div className="bg-white border border-[#e5e7eb] p-5 relative">
                      {addr.isDefault && (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-[#f5f0e8] text-[#c9a96e] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          <Star size={10} fill="currentColor" />
                          Default
                        </span>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        <MapPin size={14} className="text-[#c9a96e]" />
                        <span className="text-xs font-semibold tracking-wide uppercase text-[#1a1a1a]">
                          {addr.label}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-[#1a1a1a]">{addr.fullName}</p>
                      <p className="text-sm text-[#6b7280] mt-1 leading-relaxed">
                        {addr.street}<br />
                        {addr.city}, {addr.province.toUpperCase()} {addr.postalCode}
                      </p>
                      <p className="text-sm text-[#6b7280] mt-2">{addr.phone}</p>

                      <div className="mt-4 pt-4 border-t border-[#e5e7eb] flex items-center gap-3 flex-wrap">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            className="text-xs text-[#c9a96e] hover:text-[#b8955a] font-semibold underline"
                          >
                            Set as default
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(addr)}
                          className="ml-auto inline-flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
                        >
                          <Edit2 size={11} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(addr.id)}
                          className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash size={11} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <AddressModal
          address={editing}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

function AddressModal({
  address, onClose, onSave,
}: {
  address: Address | null;
  onClose: () => void;
  onSave: (data: AddressFormData) => void;
}) {
  const {
    register, handleSubmit, setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: address || {
      label: "", fullName: "", phone: "",
      street: "", city: "", province: "", postalCode: "",
      isDefault: false,
    },
  });

  const [isDefault, setIsDefault] = useState<boolean>(address?.isDefault ?? false);

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-lg bg-white shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#1a1a1a]">
              {address ? "Edit Address" : "New Address"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-[#6b7280] hover:text-[#1a1a1a]"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">

            <Input
              label="Label"
              required
              placeholder="e.g., Home, Office"
              {...register("label")}
              error={errors.label?.message}
            />

            <Input
              label="Full Name"
              required
              placeholder="John Doe"
              {...register("fullName")}
              error={errors.fullName?.message}
            />

            <Input
              label="Phone"
              required
              type="tel"
              placeholder="+92 300 1234567"
              {...register("phone")}
              error={errors.phone?.message}
            />

            <Input
              label="Street Address"
              required
              placeholder="House #, Street name, Area"
              {...register("street")}
              error={errors.street?.message}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                required
                placeholder="Lahore"
                {...register("city")}
                error={errors.city?.message}
              />
              <Input
                label="Postal Code"
                required
                placeholder="54000"
                {...register("postalCode")}
                error={errors.postalCode?.message}
              />
            </div>

            <Select
              label="Province"
              required
              options={[...PAKISTAN_PROVINCES]}
              {...register("province")}
              error={errors.province?.message}
            />

            <label className="flex items-center gap-2 cursor-pointer group pt-2">
              <div
                onClick={() => { setIsDefault(!isDefault); setValue("isDefault", !isDefault); }}
                className={`w-4 h-4 border-2 flex items-center justify-center transition-all ${
                  isDefault ? "border-[#c9a96e] bg-[#c9a96e]" : "border-[#e5e7eb]"
                }`}
              >
                {isDefault && <Check size={10} className="text-white" />}
              </div>
              <span className="text-sm text-[#6b7280]">Set as default address</span>
            </label>

            <div className="flex gap-3 pt-4 border-t border-[#e5e7eb]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-sm font-medium border border-[#e5e7eb] text-[#6b7280] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 text-sm font-semibold bg-[#1a1a1a] text-white hover:bg-[#c9a96e] transition-colors"
              >
                {address ? "Update" : "Save"} Address
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}