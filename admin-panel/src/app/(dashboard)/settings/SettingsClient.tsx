"use client";
import { useState } from "react";
import { FooterTab } from "./FooterTab";
import { FirstOrderTab } from "./FirstOrderTab";
import {
  Store, Phone, ShoppingBag, Cake, Award,
  DollarSign, Globe, Save, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Props {
  initialSettings: Record<string, Record<string, string>>;
}

type TabId = "restaurant" | "contact" | "abandoned_cart" | "birthday" | "loyalty" | "pricing" | "social" | "first_order" | "footer";

const TABS: Array<{ id: TabId; label: string; icon: typeof Store }> = [
  { id: "restaurant",     label: "Brand Information",   icon: Store       },
  { id: "contact",        label: "Contact Information", icon: Phone       },
  { id: "abandoned_cart", label: "Abandoned Cart",      icon: ShoppingBag },
  { id: "birthday",       label: "Birthday Rewards",    icon: Cake        },
  { id: "first_order",   label: "First Order Discount", icon: Award       },
  { id: "loyalty",        label: "Loyalty Program",     icon: Award       },
  { id: "pricing",        label: "Pricing & Tax",       icon: DollarSign  },
  { id: "social",         label: "Social Media",        icon: Globe       },
  { id: "footer",         label: "Footer Content",      icon: Globe       },
];

export function SettingsClient({ initialSettings }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("restaurant");
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateSetting = (category: TabId, key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: { ...(prev[category] ?? {}), [key]: value },
    }));
  };

  const saveCurrentTab = async () => {
    setSaving(true);
    const tabSettings = settings[activeTab] ?? {};
    const payload = Object.entries(tabSettings).map(([key, value]) => ({
      key, value, category: activeTab,
    }));

    try {
      const res = await fetch("/api/settings", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ settings: payload }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {}
    setSaving(false);
  };

  return (
    <div className="max-w-6xl space-y-5">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <Store size={22} className="text-[#c9a96e]" />
            Settings
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Configure your store and features</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">

        <div className="bg-white border border-[#e5e7eb] p-2 h-fit lg:sticky lg:top-24">
          <nav className="space-y-0.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded transition-colors text-left",
                    active
                      ? "bg-[#c9a96e] text-white font-semibold"
                      : "text-[#6b7280] hover:bg-[#fafaf9] hover:text-[#1a1a1a]"
                  )}
                >
                  <Icon size={15} />
                  <span className="flex-1">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-[#e5e7eb] p-6">
            {activeTab === "restaurant"     && <RestaurantTab     settings={settings.restaurant     ?? {}} onChange={(k, v) => updateSetting("restaurant", k, v)} />}
            {activeTab === "contact"        && <ContactTab        settings={settings.contact        ?? {}} onChange={(k, v) => updateSetting("contact", k, v)} />}
            {activeTab === "abandoned_cart" && <AbandonedCartTab  settings={settings.abandoned_cart ?? {}} onChange={(k, v) => updateSetting("abandoned_cart", k, v)} />}
            {activeTab === "birthday"       && <BirthdayTab       settings={settings.birthday       ?? {}} onChange={(k, v) => updateSetting("birthday", k, v)} />}
            {activeTab === "first_order"  && <FirstOrderTab   settings={settings.first_order  ?? {}} onChange={(k, v) => updateSetting("first_order", k, v)} />}
            {activeTab === "loyalty"        && <LoyaltyTab        settings={settings.loyalty        ?? {}} onChange={(k, v) => updateSetting("loyalty", k, v)} />}
            {activeTab === "pricing"        && <PricingTab        settings={settings.pricing        ?? {}} onChange={(k, v) => updateSetting("pricing", k, v)} />}
            {activeTab === "social"         && <SocialTab         settings={settings.social         ?? {}} onChange={(k, v) => updateSetting("social", k, v)} />}
            {activeTab === "footer"         && <FooterTab         settings={settings.footer         ?? {}} onChange={(k, v) => updateSetting("footer", k, v)} />}
          </div>

          <div className="flex justify-end">
            <Button variant="primary" size="md" onClick={saveCurrentTab} disabled={saving}>
              {saved ? (
                <><CheckCircle size={15} />Saved!</>
              ) : (
                <><Save size={15} />{saving ? "Saving..." : "Save Changes"}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TabProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

function Field({
  label, id, value, onChange, type = "text", hint, rows,
}: {
  label: string; id: string; value: string;
  onChange: (v: string) => void;
  type?: string; hint?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide uppercase text-[#1a1a1a] mb-1.5">
        {label}
      </label>
      {rows ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
          className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none resize-y font-mono" />
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none" />
      )}
      {hint && <p className="mt-1 text-[11px] text-[#6b7280]">{hint}</p>}
    </div>
  );
}

function RestaurantTab({ settings, onChange }: TabProps) {
  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Store size={16} className="text-[#c9a96e]" />
        Brand Information
      </h2>
      <div className="space-y-4">
        <Field label="Brand Name" id="brand_name" value={settings.brand_name ?? ""} onChange={(v) => onChange("brand_name", v)} />
        <Field label="Tagline" id="brand_tagline" value={settings.brand_tagline ?? ""} onChange={(v) => onChange("brand_tagline", v)} hint="Short slogan shown across the site" />
        <Field label="Description" id="brand_description" value={settings.brand_description ?? ""} onChange={(v) => onChange("brand_description", v)} rows={3} />
        <Field label="City" id="brand_city" value={settings.brand_city ?? ""} onChange={(v) => onChange("brand_city", v)} />
        <Field label="Full Address" id="brand_address" value={settings.brand_address ?? ""} onChange={(v) => onChange("brand_address", v)} rows={2} />
        <Field label="Established Year" id="brand_year" value={settings.brand_year ?? ""} onChange={(v) => onChange("brand_year", v)} />
      </div>
    </div>
  );
}

function ContactTab({ settings, onChange }: TabProps) {
  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Phone size={16} className="text-[#c9a96e]" />
        Contact Information
      </h2>
      <div className="space-y-4">
        <Field label="Primary Phone" id="contact_phone_primary" value={settings.contact_phone_primary ?? ""} onChange={(v) => onChange("contact_phone_primary", v)} type="tel" />
        <Field label="Secondary Phone" id="contact_phone_secondary" value={settings.contact_phone_secondary ?? ""} onChange={(v) => onChange("contact_phone_secondary", v)} type="tel" />
        <Field label="Email" id="contact_email" value={settings.contact_email ?? ""} onChange={(v) => onChange("contact_email", v)} type="email" />
        <Field label="WhatsApp Number" id="contact_whatsapp" value={settings.contact_whatsapp ?? ""} onChange={(v) => onChange("contact_whatsapp", v)} type="tel" hint="Include country code, no spaces. e.g. +923001234567" />
      </div>
    </div>
  );
}

function AbandonedCartTab({ settings, onChange }: TabProps) {
  const enabled = settings.abandoned_cart_enabled === "true";
  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <ShoppingBag size={16} className="text-[#c9a96e]" />
        Abandoned Cart Settings
      </h2>
      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 border border-[#e5e7eb] bg-[#fafaf9] cursor-pointer">
          <input type="checkbox" checked={enabled}
            onChange={(e) => onChange("abandoned_cart_enabled", e.target.checked ? "true" : "false")}
            className="w-4 h-4 accent-[#c9a96e]" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a1a1a]">Enable Abandoned Cart Tracking</p>
            <p className="text-xs text-[#6b7280] mt-0.5">Track customers who leave without completing checkout</p>
          </div>
        </label>
        <Field label="Inactivity Timeout (minutes)" id="abandoned_cart_timeout_minutes"
          value={settings.abandoned_cart_timeout_minutes ?? "15"} onChange={(v) => onChange("abandoned_cart_timeout_minutes", v)}
          type="number" hint="After this many minutes of inactivity, the cart is marked as abandoned" />
        <Field label="WhatsApp Follow-up Message" id="abandoned_cart_wa_message"
          value={settings.abandoned_cart_wa_message ?? ""} onChange={(v) => onChange("abandoned_cart_wa_message", v)}
          rows={6} hint="Available tokens: {{name}} - customer name, {{amount}} - cart total in PKR" />
      </div>
    </div>
  );
}

function BirthdayTab({ settings, onChange }: TabProps) {
  const enabled = settings.birthday_enabled === "true";
  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Cake size={16} className="text-[#c9a96e]" />
        Birthday Rewards
      </h2>
      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 border border-[#e5e7eb] bg-[#fafaf9] cursor-pointer">
          <input type="checkbox" checked={enabled}
            onChange={(e) => onChange("birthday_enabled", e.target.checked ? "true" : "false")}
            className="w-4 h-4 accent-[#c9a96e]" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a1a1a]">Enable Birthday Rewards</p>
            <p className="text-xs text-[#6b7280] mt-0.5">Automatic birthday discount for customers</p>
          </div>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Discount Percentage (%)" id="birthday_discount_pct" value={settings.birthday_discount_pct ?? "15"} onChange={(v) => onChange("birthday_discount_pct", v)} type="number" hint="Set 0 to use fixed amount instead" />
          <Field label="Fixed Discount Amount (Rs.)" id="birthday_fixed_amount" value={settings.birthday_fixed_amount ?? "0"} onChange={(v) => onChange("birthday_fixed_amount", v)} type="number" hint="Use instead of %. Set 0 to disable" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Minimum Order (Rs.)" id="birthday_min_order" value={settings.birthday_min_order ?? "3000"} onChange={(v) => onChange("birthday_min_order", v)} type="number" hint="Minimum cart total to redeem" />
          <Field label="Offer Validity (Days)" id="birthday_validity_days" value={settings.birthday_validity_days ?? "7"} onChange={(v) => onChange("birthday_validity_days", v)} type="number" hint="Days after birthday the offer is valid" />
        </div>
        <Field label="Reminder Period (Days)" id="birthday_reminder_days" value={settings.birthday_reminder_days ?? "7"} onChange={(v) => onChange("birthday_reminder_days", v)} type="number" hint="Show upcoming birthdays this many days ahead" />
        <Field label="Free Gift Description (optional)" id="birthday_free_gift" value={settings.birthday_free_gift ?? ""} onChange={(v) => onChange("birthday_free_gift", v)} hint="e.g. Free Denim Care Kit - mentioned in WhatsApp message" />
        <Field label="WhatsApp Message Template" id="birthday_wa_message" value={settings.birthday_wa_message ?? ""} onChange={(v) => onChange("birthday_wa_message", v)} rows={6} hint="Tokens: {{name}} {{discount}} {{minOrder}} {{days}}" />
      </div>
    </div>
  );
}

function LoyaltyTab({ settings, onChange }: TabProps) {
  const enabled = settings.loyalty_enabled === "true";
  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Award size={16} className="text-[#c9a96e]" />
        Loyalty Program
      </h2>
      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 border border-[#e5e7eb] bg-[#fafaf9] cursor-pointer">
          <input type="checkbox" checked={enabled}
            onChange={(e) => onChange("loyalty_enabled", e.target.checked ? "true" : "false")}
            className="w-4 h-4 accent-[#c9a96e]" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a1a1a]">Enable Loyalty Program</p>
            <p className="text-xs text-[#6b7280] mt-0.5">Customers earn points on every order</p>
          </div>
        </label>
        <Field label="Program Name" id="loyalty_program_name" value={settings.loyalty_program_name ?? "Denova Rewards"} onChange={(v) => onChange("loyalty_program_name", v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Earning Rate (%)" id="loyalty_earning_rate" value={settings.loyalty_earning_rate ?? "5"} onChange={(v) => onChange("loyalty_earning_rate", v)} type="number" hint="% of order value earned as points" />
          <Field label="Point Value (Rs. per point)" id="loyalty_point_value" value={settings.loyalty_point_value ?? "1"} onChange={(v) => onChange("loyalty_point_value", v)} type="number" hint="1 point = X Rs when redeemed" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Minimum Points to Redeem" id="loyalty_min_redemption" value={settings.loyalty_min_redemption ?? "100"} onChange={(v) => onChange("loyalty_min_redemption", v)} type="number" hint="Customer needs at least this many points" />
          <Field label="Max Redemption % per Order" id="loyalty_max_redemption_pct" value={settings.loyalty_max_redemption_pct ?? "20"} onChange={(v) => onChange("loyalty_max_redemption_pct", v)} type="number" hint="Max % of order that can be paid with points" />
        </div>
      </div>
    </div>
  );
}

function PricingTab({ settings, onChange }: TabProps) {
  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <DollarSign size={16} className="text-[#c9a96e]" />
        Pricing &amp; Tax
      </h2>
      <div className="space-y-4">
        <Field label="Tax Percentage (%)" id="tax_percentage" value={settings.tax_percentage ?? "0"} onChange={(v) => onChange("tax_percentage", v)} type="number" />
        <Field label="Currency Symbol" id="currency_symbol" value={settings.currency_symbol ?? "Rs."} onChange={(v) => onChange("currency_symbol", v)} />
        <Field label="Free Shipping Threshold (Rs.)" id="free_shipping_threshold" value={settings.free_shipping_threshold ?? "5000"} onChange={(v) => onChange("free_shipping_threshold", v)} type="number" />
        <Field label="Default Shipping Cost (Rs.)" id="shipping_cost_default" value={settings.shipping_cost_default ?? "250"} onChange={(v) => onChange("shipping_cost_default", v)} type="number" />
      </div>
    </div>
  );
}

function SocialTab({ settings, onChange }: TabProps) {
  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Globe size={16} className="text-[#c9a96e]" />
        Social Media Links
      </h2>
      <div className="space-y-4">
        <Field label="Facebook URL" id="social_facebook" value={settings.social_facebook ?? ""} onChange={(v) => onChange("social_facebook", v)} type="url" />
        <Field label="Instagram URL" id="social_instagram" value={settings.social_instagram ?? ""} onChange={(v) => onChange("social_instagram", v)} type="url" />
        <Field label="TikTok URL" id="social_tiktok" value={settings.social_tiktok ?? ""} onChange={(v) => onChange("social_tiktok", v)} type="url" />
      </div>
    </div>
  );
}