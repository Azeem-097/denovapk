"use client";
import { Gift } from "lucide-react";

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
          className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none resize-y" />
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none" />
      )}
      {hint && <p className="mt-1 text-[11px] text-[#6b7280]">{hint}</p>}
    </div>
  );
}

export function FirstOrderTab({ settings, onChange }: TabProps) {
  const enabled = settings.first_order_enabled === "true";

  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Gift size={16} className="text-[#c9a96e]" />
        First Order Discount
      </h2>
      <p className="text-xs text-[#6b7280] mb-6">
        Automatically give new customers a discount on their very first order.
      </p>

      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 border border-[#e5e7eb] bg-[#fafaf9] cursor-pointer">
          <input type="checkbox" checked={enabled}
            onChange={(e) => onChange("first_order_enabled", e.target.checked ? "true" : "false")}
            className="w-4 h-4 accent-[#c9a96e]" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a1a1a]">Enable First Order Discount</p>
            <p className="text-xs text-[#6b7280] mt-0.5">Automatically applied to customers with zero previous orders</p>
          </div>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Discount Percentage (%)" id="first_order_discount_pct"
            value={settings.first_order_discount_pct ?? "10"}
            onChange={(v) => onChange("first_order_discount_pct", v)}
            type="number" hint="Set 0 to use fixed amount instead" />
          <Field label="Fixed Discount Amount (Rs.)" id="first_order_fixed_amount"
            value={settings.first_order_fixed_amount ?? "0"}
            onChange={(v) => onChange("first_order_fixed_amount", v)}
            type="number" hint="Use instead of %. Set 0 to disable" />
        </div>

        <Field label="Minimum Order (Rs.)" id="first_order_min_order"
          value={settings.first_order_min_order ?? "2000"}
          onChange={(v) => onChange("first_order_min_order", v)}
          type="number" hint="Customer must order at least this amount to receive the discount" />

        <Field label="Welcome Message" id="first_order_message"
          value={settings.first_order_message ?? ""}
          onChange={(v) => onChange("first_order_message", v)}
          rows={3} hint="Shown to new customers at checkout. Use {{discount}} for the discount amount" />

        <div className="bg-[#f5f0e8] border border-[#c9a96e]/30 p-4 text-xs text-[#1a1a1a]">
          <p className="font-semibold mb-1">Priority Rule</p>
          <p className="text-[#6b7280] leading-relaxed">
            If a customer qualifies for both First Order Discount and Birthday Discount,
            the <strong>Birthday Discount takes priority</strong>. Only one promotional benefit
            can be applied per order. Loyalty rewards are not available when either discount is active.
          </p>
        </div>
      </div>
    </div>
  );
}