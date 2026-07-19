"use client";
import { useState } from "react";
import { FooterTab } from "./FooterTab";
import { FirstOrderTab } from "./FirstOrderTab";
import { ShippingTab } from "./ShippingTab";
import { PaymentMethodsTab } from "./PaymentMethodsTab";
import {
  Store, Phone, ShoppingBag, Cake, Award,
  DollarSign, Globe, Save, CheckCircle, MessageCircle, Truck, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Props {
  initialSettings: Record<string, Record<string, string>>;
}

type TabId =
  | "restaurant" | "contact" | "abandoned_cart" | "birthday"
  | "loyalty" | "pricing" | "shipping" | "payments" | "social"
  | "first_order" | "footer" | "whatsapp";

const TABS: Array<{ id: TabId; label: string; icon: typeof Store }> = [
  { id: "restaurant",     label: "Brand Information",   icon: Store       },
  { id: "contact",        label: "Contact Information", icon: Phone       },
  { id: "whatsapp",       label: "WhatsApp Widget",     icon: MessageCircle },
  { id: "shipping",       label: "Shipping & Delivery", icon: Truck       },
  { id: "payments",       label: "Payment Methods",     icon: CreditCard  },
  { id: "abandoned_cart", label: "Abandoned Cart",      icon: ShoppingBag },
  { id: "birthday",       label: "Birthday Rewards",    icon: Cake        },
  { id: "first_order",    label: "First Order Discount", icon: Award      },
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

    if (activeTab === "whatsapp") {
      const config = {
        enabled:          (tabSettings.enabled ?? "true") === "true",
        phone:            tabSettings.phone ?? "",
        communityLink:    tabSettings.communityLink ?? "",
        greeting:         tabSettings.greeting ?? "Hi! I'm interested in Denova PK.",
        directLabel:      tabSettings.directLabel ?? "Direct Message",
        communityLabel:   tabSettings.communityLabel ?? "Join Community",
        directSubtext:    tabSettings.directSubtext ?? "Chat with our support team",
        communitySubtext: tabSettings.communitySubtext ?? "Join our WhatsApp community",
      };

      try {
        const res = await fetch("/api/settings", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            settings: [{ key: "whatsapp_widget", value: JSON.stringify(config), category: "whatsapp" }]
          }),
        });
        if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
      } catch {}
      setSaving(false);
      return;
    }

    const payload = Object.entries(tabSettings).map(([key, value]) => ({
      key, value, category: activeTab,
    }));

    try {
      const res = await fetch("/api/settings", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ settings: payload }),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    } catch {}
    setSaving(false);
  };

  const whatsappSettings = (() => {
    if (settings.whatsapp && Object.keys(settings.whatsapp).length > 0) {
      return settings.whatsapp;
    }
    return {};
  })();

  return (
    <div className="max-w-6xl space-y-5">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <Store size={22} className="text-[#3b5f8f]" />
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
                      ? "bg-[#3b5f8f] text-white font-semibold"
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
            {activeTab === "whatsapp"       && <WhatsAppTab       settings={whatsappSettings              } onChange={(k, v) => updateSetting("whatsapp", k, v)} />}
            {activeTab === "shipping"       && <ShippingTab       settings={settings.shipping       ?? {}} onChange={(k, v) => updateSetting("shipping", k, v)} />}
            {activeTab === "payments"       && <PaymentMethodsTab settings={settings.payments      ?? {}} onChange={(k, v) => updateSetting("payments", k, v)} />}
            {activeTab === "abandoned_cart" && <AbandonedCartTab  settings={settings.abandoned_cart ?? {}} onChange={(k, v) => updateSetting("abandoned_cart", k, v)} />}
            {activeTab === "birthday"       && <BirthdayTab       settings={settings.birthday       ?? {}} onChange={(k, v) => updateSetting("birthday", k, v)} />}
            {activeTab === "first_order"    && <FirstOrderTab     settings={settings.first_order    ?? {}} onChange={(k, v) => updateSetting("first_order", k, v)} />}
            {activeTab === "loyalty"        && <LoyaltyTab        settings={settings.loyalty        ?? {}} onChange={(k, v) => updateSetting("loyalty", k, v)} />}
            {activeTab === "pricing"        && <PricingTab        settings={settings.pricing        ?? {}} onChange={(k, v) => updateSetting("pricing", k, v)} />}
            {activeTab === "social"         && <SocialTab         settings={settings.social         ?? {}} onChange={(k, v) => updateSetting("social", k, v)} />}
            {activeTab === "footer"         && <FooterTab         settings={settings.footer         ?? {}} onChange={(k, v) => updateSetting("footer", k, v)} />}
          </div>

          <div className="flex justify-end">
            <Button variant="primary" size="md" onClick={saveCurrentTab} disabled={saving}>
              {saved ? (<><CheckCircle size={15} />Saved!</>) : (<><Save size={15} />{saving ? "Saving..." : "Save Changes"}</>)}
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
          className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none resize-y" />
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none" />
      )}
      {hint && <p className="mt-1 text-[11px] text-[#6b7280]">{hint}</p>}
    </div>
  );
}

function RestaurantTab({ settings, onChange }: TabProps) {
  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Store size={16} className="text-[#3b5f8f]" />
        Brand Information
      </h2>
      <div className="space-y-4">
        <Field label="Brand Name" id="brand_name" value={settings.brand_name ?? ""} onChange={(v) => onChange("brand_name", v)} />
        <Field label="Tagline" id="brand_tagline" value={settings.brand_tagline ?? ""} onChange={(v) => onChange("brand_tagline", v)} hint="Short slogan shown across the site" />
        <Field label="Description" id="brand_description" value={settings.brand_description ?? ""} onChange={(v) => onChange("brand_description", v)} rows={3} />
        <Field label="City" id="brand_city" value={settings.brand_city ?? ""} onChange={(v) => onChange("brand_city", v)} />
        <Field label="Full Address" id="brand_address" value={settings.brand_address ?? ""} onChange={(v) => onChange("brand_address", v)} rows={2}
          hint="Shown on Contact page and legal pages (Privacy, Terms)" />
        <Field label="Established Year" id="brand_year" value={settings.brand_year ?? ""} onChange={(v) => onChange("brand_year", v)} />

        <div className="pt-4 border-t border-[#e5e7eb]">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#3b5f8f] mb-3">Legal Pages</h3>
          <Field
            label="Last Updated Date"
            id="legal_last_updated"
            value={settings.legal_last_updated ?? "July 2026"}
            onChange={(v) => onChange("legal_last_updated", v)}
            hint="Shown at top of Privacy Policy and Terms of Service. e.g. 'July 2026'. Update whenever you revise the policies."
          />
        </div>
      </div>
    </div>
  );
}

function ContactTab({ settings, onChange }: TabProps) {
  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Phone size={16} className="text-[#3b5f8f]" />
        Contact Information
      </h2>
      <p className="text-xs text-[#6b7280] mb-4">
        These details are shown on the Contact page, legal pages (Privacy, Terms, Shipping), and in the footer.
      </p>
      <div className="space-y-4">
        <Field label="Primary Phone" id="contact_phone_primary" value={settings.contact_phone_primary ?? ""} onChange={(v) => onChange("contact_phone_primary", v)} type="tel" hint="Shown across the site. e.g. +92 300 123 4567" />
        <Field label="Secondary Phone" id="contact_phone_secondary" value={settings.contact_phone_secondary ?? ""} onChange={(v) => onChange("contact_phone_secondary", v)} type="tel" />
        <Field label="Email" id="contact_email" value={settings.contact_email ?? ""} onChange={(v) => onChange("contact_email", v)} type="email" />
        <Field label="WhatsApp Number" id="contact_whatsapp" value={settings.contact_whatsapp ?? ""} onChange={(v) => onChange("contact_whatsapp", v)} type="tel" hint="Include country code, no spaces. e.g. +923001234567" />
      </div>
    </div>
  );
}

function WhatsAppTab({ settings, onChange }: TabProps) {
  const enabled = (settings.enabled ?? "true") === "true";
  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <MessageCircle size={16} className="text-[#3b5f8f]" />
        WhatsApp Floating Widget
      </h2>
      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 border border-[#e5e7eb] bg-[#fafaf9] cursor-pointer">
          <input type="checkbox" checked={enabled}
            onChange={(e) => onChange("enabled", e.target.checked ? "true" : "false")}
            className="w-4 h-4 accent-[#3b5f8f]" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a1a1a]">Show floating WhatsApp button on website</p>
            <p className="text-xs text-[#6b7280] mt-0.5">Appears in bottom-right corner of every page</p>
          </div>
        </label>

        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#3b5f8f] mb-3">Direct Message Option</h3>
          <div className="space-y-4">
            <Field label="WhatsApp Phone Number" id="phone"
              value={settings.phone ?? ""} onChange={(v) => onChange("phone", v)} type="tel" />
            <Field label="Greeting Message (pre-filled in chat)" id="greeting"
              value={settings.greeting ?? "Hi! I'm interested in Denova PK."}
              onChange={(v) => onChange("greeting", v)} rows={2} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Button Label" id="directLabel"
                value={settings.directLabel ?? "Direct Message"}
                onChange={(v) => onChange("directLabel", v)} />
              <Field label="Button Subtext" id="directSubtext"
                value={settings.directSubtext ?? "Chat with our support team"}
                onChange={(v) => onChange("directSubtext", v)} />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#e5e7eb]">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#3b5f8f] mb-3">Community Option</h3>
          <div className="space-y-4">
            <Field label="Community / Group Invite Link" id="communityLink"
              value={settings.communityLink ?? ""}
              onChange={(v) => onChange("communityLink", v)} type="url" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Button Label" id="communityLabel"
                value={settings.communityLabel ?? "Join Community"}
                onChange={(v) => onChange("communityLabel", v)} />
              <Field label="Button Subtext" id="communitySubtext"
                value={settings.communitySubtext ?? "Join our WhatsApp community"}
                onChange={(v) => onChange("communitySubtext", v)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AbandonedCartTab({ settings, onChange }: TabProps) {
  const enabled = settings.abandoned_cart_enabled === "true";
  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <ShoppingBag size={16} className="text-[#3b5f8f]" />
        Abandoned Cart Settings
      </h2>
      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 border border-[#e5e7eb] bg-[#fafaf9] cursor-pointer">
          <input type="checkbox" checked={enabled}
            onChange={(e) => onChange("abandoned_cart_enabled", e.target.checked ? "true" : "false")}
            className="w-4 h-4 accent-[#3b5f8f]" />
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
          rows={6} hint="Available tokens: {{name}}, {{amount}}" />
      </div>
    </div>
  );
}

function BirthdayTab({ settings, onChange }: TabProps) {
  const enabled = settings.birthday_enabled === "true";
  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Cake size={16} className="text-[#3b5f8f]" />
        Birthday Rewards
      </h2>
      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 border border-[#e5e7eb] bg-[#fafaf9] cursor-pointer">
          <input type="checkbox" checked={enabled}
            onChange={(e) => onChange("birthday_enabled", e.target.checked ? "true" : "false")}
            className="w-4 h-4 accent-[#3b5f8f]" />
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
          <Field label="Minimum Order (Rs.)" id="birthday_min_order" value={settings.birthday_min_order ?? "3000"} onChange={(v) => onChange("birthday_min_order", v)} type="number" />
          <Field label="Offer Validity (Days)" id="birthday_validity_days" value={settings.birthday_validity_days ?? "7"} onChange={(v) => onChange("birthday_validity_days", v)} type="number" />
        </div>
        <Field label="Reminder Period (Days)" id="birthday_reminder_days" value={settings.birthday_reminder_days ?? "7"} onChange={(v) => onChange("birthday_reminder_days", v)} type="number" />
        <Field label="Free Gift Description (optional)" id="birthday_free_gift" value={settings.birthday_free_gift ?? ""} onChange={(v) => onChange("birthday_free_gift", v)} />
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
        <Award size={16} className="text-[#3b5f8f]" />
        Loyalty Program
      </h2>
      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 border border-[#e5e7eb] bg-[#fafaf9] cursor-pointer">
          <input type="checkbox" checked={enabled}
            onChange={(e) => onChange("loyalty_enabled", e.target.checked ? "true" : "false")}
            className="w-4 h-4 accent-[#3b5f8f]" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a1a1a]">Enable Loyalty Program</p>
            <p className="text-xs text-[#6b7280] mt-0.5">Customers earn points on every order</p>
          </div>
        </label>
        <Field label="Program Name" id="loyalty_program_name" value={settings.loyalty_program_name ?? "Denova Rewards"} onChange={(v) => onChange("loyalty_program_name", v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Earning Rate (%)" id="loyalty_earning_rate" value={settings.loyalty_earning_rate ?? "5"} onChange={(v) => onChange("loyalty_earning_rate", v)} type="number" />
          <Field label="Point Value (Rs. per point)" id="loyalty_point_value" value={settings.loyalty_point_value ?? "1"} onChange={(v) => onChange("loyalty_point_value", v)} type="number" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Minimum Points to Redeem" id="loyalty_min_redemption" value={settings.loyalty_min_redemption ?? "100"} onChange={(v) => onChange("loyalty_min_redemption", v)} type="number" />
          <Field label="Max Redemption % per Order" id="loyalty_max_redemption_pct" value={settings.loyalty_max_redemption_pct ?? "20"} onChange={(v) => onChange("loyalty_max_redemption_pct", v)} type="number" />
        </div>
      </div>
    </div>
  );
}

function PricingTab({ settings, onChange }: TabProps) {
  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <DollarSign size={16} className="text-[#3b5f8f]" />
        Pricing &amp; Tax
      </h2>
      <p className="text-xs text-[#6b7280] mb-4">
        Shipping costs are managed in the Shipping tab. Payment methods are managed in the Payment Methods tab.
      </p>
      <div className="space-y-4">
        <Field label="Tax Percentage (%)" id="tax_percentage" value={settings.tax_percentage ?? "0"} onChange={(v) => onChange("tax_percentage", v)} type="number" />
        <Field label="Currency Symbol" id="currency_symbol" value={settings.currency_symbol ?? "Rs."} onChange={(v) => onChange("currency_symbol", v)} />
      </div>
    </div>
  );
}

function SocialTab({ settings, onChange }: TabProps) {
  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Globe size={16} className="text-[#3b5f8f]" />
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