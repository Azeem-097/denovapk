"use client";
import { Truck, Info } from "lucide-react";

interface TabProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

function Field({
  label, id, value, onChange, type = "text", hint, prefix, disabled,
}: {
  label: string; id: string; value: string;
  onChange: (v: string) => void;
  type?: string; hint?: string; prefix?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide uppercase text-[#1a1a1a] mb-1.5">
        {label}
      </label>
      <div className="flex">
        {prefix && (
          <span className="inline-flex items-center px-3 bg-[#fafaf9] border border-r-0 border-[#e5e7eb] text-xs font-semibold text-[#6b7280]">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none disabled:bg-[#fafaf9] disabled:text-[#9ca3af] disabled:cursor-not-allowed"
        />
      </div>
      {hint && <p className="mt-1 text-[11px] text-[#6b7280]">{hint}</p>}
    </div>
  );
}

function fmt(rupees: number): string {
  return `Rs. ${Math.round(rupees).toLocaleString("en-PK")}`;
}

export function ShippingTab({ settings, onChange }: TabProps) {
  const freeDelivery = settings.free_delivery_all === "true";
  const baseCost     = Number(settings.shipping_base_cost ?? "250") || 0;
  const threshold    = Number(settings.free_shipping_threshold ?? "5000") || 0;
  const codFee       = Number(settings.cod_extra_fee ?? "0") || 0;

  const previewOrders = [
    { subtotal: 1500,  label: "Small order" },
    { subtotal: 4000,  label: "Medium order" },
    { subtotal: 7500,  label: "Large order" },
  ];

  const calcShipping = (subtotal: number) => {
    if (freeDelivery) return 0;
    if (threshold > 0 && subtotal >= threshold) return 0;
    return baseCost;
  };

  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Truck size={16} className="text-[#3b5f8f]" />
        Shipping & Delivery
      </h2>
      <p className="text-xs text-[#6b7280] mb-6">
        Configure how shipping costs are calculated at checkout.
      </p>

      <div className="space-y-4">

        {/* MASTER TOGGLE */}
        <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${
          freeDelivery ? "border-[#3b5f8f] bg-[#f5f0e8]/40" : "border-[#e5e7eb] bg-[#fafaf9]"
        }`}>
          <input type="checkbox" checked={freeDelivery}
            onChange={(e) => onChange("free_delivery_all", e.target.checked ? "true" : "false")}
            className="w-4 h-4 accent-[#3b5f8f]" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a1a1a]">Free Delivery on All Orders</p>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Master switch — when enabled, all orders ship free regardless of order value
            </p>
          </div>
          {freeDelivery && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#3b5f8f] text-white px-2 py-1">
              Active
            </span>
          )}
        </label>

        {/* SHIPPING COST FIELDS */}
        <div className={freeDelivery ? "opacity-50 pointer-events-none" : ""}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Base Shipping Cost" id="shipping_base_cost"
              value={settings.shipping_base_cost ?? "250"}
              onChange={(v) => onChange("shipping_base_cost", v)}
              type="number" prefix="Rs." disabled={freeDelivery}
              hint="Charged on orders below the free-shipping threshold" />
            <Field label="Free Shipping Threshold" id="free_shipping_threshold"
              value={settings.free_shipping_threshold ?? "5000"}
              onChange={(v) => onChange("free_shipping_threshold", v)}
              type="number" prefix="Rs." disabled={freeDelivery}
              hint="Orders at or above this amount ship free. Set 0 to disable" />
          </div>
        </div>

        {/* COD FEE (toggle moved to Payment Methods tab) */}
        <div className="pt-4 border-t border-[#e5e7eb]">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#3b5f8f] mb-3">
            COD Handling Fee
          </h3>
          <p className="text-xs text-[#6b7280] mb-3">
            Enable/disable Cash on Delivery in the <strong>Payment Methods</strong> tab.
            This fee is added when a customer chooses COD.
          </p>
          <Field label="COD Extra Fee (optional)" id="cod_extra_fee"
            value={settings.cod_extra_fee ?? "0"}
            onChange={(v) => onChange("cod_extra_fee", v)}
            type="number" prefix="Rs."
            hint="Additional fee added when customer chooses COD. Set 0 to disable" />
        </div>

        {/* LIVE PREVIEW */}
        <div className="pt-4 border-t border-[#e5e7eb]">
          <div className="flex items-center gap-2 mb-3">
            <Info size={14} className="text-[#3b5f8f]" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#3b5f8f]">Customer Preview</h3>
          </div>
          <p className="text-xs text-[#6b7280] mb-4">This is what customers will see at checkout for different order sizes:</p>

          <div className="border border-[#e5e7eb] divide-y divide-[#e5e7eb]">
            {previewOrders.map((order) => {
              const ship  = calcShipping(order.subtotal);
              const total = order.subtotal + ship;
              return (
                <div key={order.subtotal} className="p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide">{order.label}</span>
                    <span className="text-xs text-[#6b7280]">{fmt(order.subtotal)}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6b7280]">Subtotal</span>
                      <span className="text-[#1a1a1a]">{fmt(order.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6b7280]">Shipping</span>
                      <span className={ship === 0 ? "text-green-600 font-semibold" : "text-[#1a1a1a]"}>
                        {ship === 0 ? "FREE" : fmt(ship)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#e5e7eb] font-semibold">
                      <span className="text-[#1a1a1a]">Total</span>
                      <span className="text-[#1a1a1a]">{fmt(total)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {codFee > 0 && (
            <p className="mt-3 text-[11px] text-[#6b7280]">
              Note: An additional {fmt(codFee)} COD fee is added when customer selects Cash on Delivery (if COD is enabled in Payment Methods).
            </p>
          )}
        </div>

        <div className="bg-[#f5f0e8] border border-[#3b5f8f]/30 p-4 text-xs text-[#1a1a1a]">
          <p className="font-semibold mb-1">How it works</p>
          <ul className="text-[#6b7280] leading-relaxed space-y-1 list-disc list-inside">
            <li><strong>Free Delivery Master Switch</strong> overrides everything — all orders ship free.</li>
            <li>Otherwise, orders above the threshold ship free; below it, the base cost applies.</li>
            <li>Setting threshold to <strong>0</strong> disables free shipping (all orders pay base cost).</li>
            <li>COD fee is only added if COD is enabled in the <strong>Payment Methods</strong> tab.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}