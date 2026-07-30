"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Lock, Bell, Trash, Save } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Input } from "@/components/ui/Input";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { AccountSidebar, NotLoggedInState } from "@/components/account/AccountSidebar";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { profileSchema, passwordChangeSchema, type ProfileFormData, type PasswordChangeFormData } from "@/lib/validations";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, isLoggedIn, updateUser, logout } = useAuthStore();
  const showToast = useToastStore((s) => s.addToast);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  if (!isLoggedIn || !user) return <NotLoggedInState />;

  return (
    <>
      <div className="pt-28 pb-8 sm:pt-32 sm:pb-10 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Account", href: "/account/dashboard" },
                { label: "Settings" },
              ]}
              className="mb-4"
            />
          </FadeIn>
          <TextReveal as="h1">
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a]">
              Account Settings
            </span>
          </TextReveal>
          <FadeIn delay={100}>
            <p className="text-[#6b7280] text-sm mt-2">
              Manage your profile, password, and preferences
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
          <FadeIn><AccountSidebar /></FadeIn>

          <div className="space-y-6">

            {/* Profile section */}
            <FadeIn>
              <ProfileForm
                user={user}
                onSave={(data) => {
                  updateUser(data);
                  showToast({ type: "success", message: "Profile updated" });
                }}
              />
            </FadeIn>

            {/* Password section */}
            <FadeIn delay={100}>
              <PasswordForm
                onSave={() => {
                  showToast({ type: "success", message: "Password changed successfully" });
                }}
              />
            </FadeIn>

            {/* Notifications */}
            <FadeIn delay={200}>
              <NotificationsSection showToast={showToast} />
            </FadeIn>

            {/* Danger zone */}
            <FadeIn delay={300}>
              <div className="bg-white border border-red-200 p-5 lg:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Trash size={16} className="text-red-500" />
                  <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-red-500">
                    Danger Zone
                  </h2>
                </div>
                <p className="text-xs text-[#6b7280] mb-4 leading-relaxed">
                  Once you delete your account, there is no going back. All your data, orders, and wishlist will be permanently removed.
                </p>
                <button
                  onClick={() => {
                    if (confirm("Are you sure? This action cannot be undone.")) {
                      logout();
                      showToast({ type: "info", message: "Account deleted (demo)" });
                      router.push("/");
                    }
                  }}
                  className="inline-flex items-center gap-2 border border-red-500 text-red-500 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-red-500 hover:text-white transition-colors"
                >
                  Delete My Account
                </button>
              </div>
            </FadeIn>

          </div>
        </div>
      </div>
    </>
  );
}

function ProfileForm({
  user, onSave,
}: {
  user: { name: string; email: string; phone?: string };
  onSave: (data: ProfileFormData) => void;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, email: user.email, phone: user.phone || "" },
  });

  const onSubmit = async (data: ProfileFormData) => {
    await new Promise((r) => setTimeout(r, 600));
    onSave(data);
  };

  return (
    <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-5">
        <User size={16} className="text-[#F97316]" />
        <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
          Profile Information
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          required
          {...register("name")}
          error={errors.name?.message}
        />
        <Input
          label="Email"
          required
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          label="Phone"
          type="tel"
          {...register("phone")}
          error={errors.phone?.message}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-[#F97316] transition-colors disabled:opacity-60"
        >
          <Save size={13} />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function PasswordForm({ onSave }: { onSave: () => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onSubmit = async (data: PasswordChangeFormData) => {
    void data;
    await new Promise((r) => setTimeout(r, 600));
    onSave();
    reset();
  };

  return (
    <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-5">
        <Lock size={16} className="text-[#F97316]" />
        <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
          Change Password
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Current Password"
          required
          type="password"
          {...register("currentPassword")}
          error={errors.currentPassword?.message}
        />
        <Input
          label="New Password"
          required
          type="password"
          {...register("newPassword")}
          error={errors.newPassword?.message}
        />
        <Input
          label="Confirm New Password"
          required
          type="password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-[#F97316] transition-colors disabled:opacity-60"
        >
          <Lock size={13} />
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

function NotificationsSection({ showToast }: {
  showToast: (t: { type: "success" | "error" | "info"; message: string }) => void;
}) {
  const [prefs, setPrefs] = useState({
    orderUpdates: true,
    promotions:   true,
    newsletter:   true,
    sms:          false,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    showToast({ type: "success", message: "Preferences updated" });
  };

  return (
    <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-5">
        <Bell size={16} className="text-[#F97316]" />
        <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
          Email Notifications
        </h2>
      </div>

      <div className="space-y-3">
        {[
          { key: "orderUpdates", label: "Order updates",      desc: "Get notified about order status changes" },
          { key: "promotions",   label: "Promotions & Offers", desc: "Exclusive discounts and sales" },
          { key: "newsletter",   label: "Weekly Newsletter",   desc: "Latest arrivals and style tips" },
          { key: "sms",          label: "SMS Notifications",   desc: "Order updates via SMS" },
        ].map((item) => (
          <label
            key={item.key}
            className="flex items-start justify-between gap-3 py-3 border-b border-[#e5e7eb] last:border-b-0 cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1a1a1a]">{item.label}</p>
              <p className="text-xs text-[#6b7280] mt-0.5">{item.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(item.key as keyof typeof prefs)}
              className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-1 ${
                prefs[item.key as keyof typeof prefs] ? "bg-[#F97316]" : "bg-[#e5e7eb]"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  prefs[item.key as keyof typeof prefs] ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        ))}
      </div>
    </div>
  );
}