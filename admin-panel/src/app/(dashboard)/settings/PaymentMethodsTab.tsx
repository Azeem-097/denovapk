"use client";
import { CreditCard, Truck, Smartphone, Wallet, Building2, AlertTriangle } from "lucide-react";

interface TabProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

interface PaymentMethodDef {
  id:    string;   // key suffix (e.g. "cod")
  key:   string;   // full setting key (e.g. "payment_cod_enabled")
  label: string;
  desc:  string;
  icon:  typeof CreditCard;
}

const PAYMENT_METHODS: PaymentMethodDef[] = [
  {
    id:    "cod",
    key:   "payment_cod_enabled",
    label: "Cash on Delivery (COD)",
    desc:  "Customer pays cash when the order is delivered",
    icon:  Truck,
  },
  {
    id:    "card",
    key:   "payment_card_enabled",
    label: "Credit / Debit Card",
    desc:  "Visa, Mastercard, and other cards",
    icon:  CreditCard,
  },
  {
    id:    "jazzcash",
    key:   "payment_jazzcash_enabled",
    label: "JazzCash",
    desc:  "Pay via JazzCash mobile wallet",
    icon:  Smartphone,
  },
  {
    id:    "easypaisa",
    key:   "payment_easypaisa_enabled",
    label: "Easypaisa",
    desc:  "Pay via Easypaisa mobile wallet",
    icon:  Wallet,
  },
  {
    id:    "bank",
    key:   "payment_bank_enabled",
    label: "Bank Transfer",
    desc:  "Direct bank transfer to your account",
    icon:  Building2,
  },
];

export function PaymentMethodsTab({ settings, onChange }: TabProps) {

  const isEnabled = (key: string) => (settings[key] ?? "true") === "true";

  // Count enabled methods for warning banner
  const enabledCount = PAYMENT_METHODS.filter((m) => isEnabled(m.key)).length;

  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <CreditCard size={16} className="text-[#E10600]" />
        Payment Methods
      </h2>
      <p className="text-xs text-[#6b7280] mb-6">
        Enable or disable payment methods available to customers at checkout.
      </p>

      {/* ─── Warning: no methods enabled ─── */}
      {enabledCount === 0 && (
        <div className="bg-red-50 border border-red-300 p-4 mb-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-semibold text-red-900">All payment methods are disabled!</p>
            <p className="text-red-700 mt-0.5">
              Customers will not be able to complete checkout. Enable at least one payment method below.
            </p>
          </div>
        </div>
      )}

      {/* ─── Payment methods list ─── */}
      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const enabled = isEnabled(method.key);

          return (
            <label
              key={method.id}
              className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                enabled
                  ? "border-[#E10600] bg-[#f5f0e8]/40"
                  : "border-[#e5e7eb] bg-[#fafaf9]"
              }`}
            >
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => onChange(method.key, e.target.checked ? "true" : "false")}
                className="w-4 h-4 accent-[#E10600]"
              />

              <Icon
                size={22}
                className={enabled ? "text-[#E10600]" : "text-[#6b7280]"}
                strokeWidth={1.75}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a1a1a]">{method.label}</p>
                <p className="text-xs text-[#6b7280] mt-0.5">{method.desc}</p>
              </div>

              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${
                  enabled
                    ? "bg-[#E10600] text-white"
                    : "bg-[#e5e7eb] text-[#6b7280]"
                }`}
              >
                {enabled ? "Active" : "Off"}
              </span>
            </label>
          );
        })}
      </div>

      {/* ─── Info box ─── */}
      <div className="mt-6 bg-[#f5f0e8] border border-[#E10600]/30 p-4 text-xs text-[#1a1a1a]">
        <p className="font-semibold mb-1">How it works</p>
        <ul className="text-[#6b7280] leading-relaxed space-y-1 list-disc list-inside">
          <li>Only <strong>enabled</strong> payment methods appear at checkout.</li>
          <li>Disabled methods are automatically removed from customer view.</li>
          <li>The <strong>COD handling fee</strong> is configured in the <strong>Shipping</strong> tab.</li>
          <li>Changes apply immediately after saving.</li>
        </ul>
      </div>
    </div>
  );
}