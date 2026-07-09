"use client";
import { Store, CreditCard, Truck, Bell, Globe, Users, Palette } from "lucide-react";
import Link from "next/link";

const SETTINGS = [
  { icon: Store,      title: "Store Details",       desc: "Business name, contact, address",           href: "#" },
  { icon: Palette,    title: "Brand & Design",      desc: "Logo, colors, typography",                  href: "#" },
  { icon: CreditCard, title: "Payment Methods",     desc: "Configure payment gateways",                href: "#" },
  { icon: Truck,      title: "Shipping",            desc: "Zones, rates, carriers",                    href: "#" },
  { icon: Globe,      title: "Domain & SEO",        desc: "Domain, meta tags, sitemap",                href: "#" },
  { icon: Bell,       title: "Notifications",       desc: "Email, SMS, WhatsApp templates",            href: "#" },
  { icon: Users,      title: "Customer Accounts",   desc: "Registration, guest checkout",              href: "#" },
];

export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Settings</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">Configure your store, payments, shipping, and more.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SETTINGS.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="group bg-white border border-[#e5e7eb] p-5 hover:border-[#c9a96e] transition-colors flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-[#f5f0e8] flex items-center justify-center flex-shrink-0 group-hover:bg-[#c9a96e] transition-colors">
              <s.icon size={18} className="text-[#c9a96e] group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">{s.title}</h3>
              <p className="text-xs text-[#6b7280] leading-relaxed">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-[#f5f0e8] border border-[#c9a96e]/30 p-5 text-center">
        <p className="text-sm font-semibold text-[#1a1a1a]">Full Settings Panels Coming Soon</p>
        <p className="text-xs text-[#6b7280] mt-1">Complete configuration UIs will be built after database integration.</p>
      </div>
    </div>
  );
}