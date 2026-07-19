"use client";
import { useMemo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Buy More, Save More" bundle selector.
 *
 * Discount tiers (applied ON TOP of current price):
 *   Buy 1 -> no extra discount
 *   Buy 2 -> 4% off subtotal
 *   Buy 3 -> 7% off subtotal
 *   Buy 4 -> 10% off subtotal (BEST VALUE)
 *
 * If the product itself is already on sale (compareAtPrice > price), we display
 * a combined "total savings %" vs. the compareAtPrice — e.g. 50% base + 4% bundle
 * = 54% total. This mirrors the ELO reference behaviour.
 */

export interface BundleTier {
  qty:      number;         // 1, 2, 3, 4
  offPct:   number;         // Extra bundle % off (0, 4, 7, 10)
  isBest?:  boolean;
}

export const BUNDLE_TIERS: BundleTier[] = [
  { qty: 1, offPct: 0 },
  { qty: 2, offPct: 4 },
  { qty: 3, offPct: 7 },
  { qty: 4, offPct: 10, isBest: true },
];

interface Props {
  currentPrice:        number;                    // e.g. 3199 (rupees)
  compareAtPrice?:     number;                    // e.g. 6400 (rupees)
  selectedQty:         number;                    // 1 / 2 / 3 / 4
  onSelectQty:         (qty: number) => void;
}

function formatPKR(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString("en-PK")}`;
}

export function BundleSelector({
  currentPrice,
  compareAtPrice,
  selectedQty,
  onSelectQty,
}: Props) {
  const tiers = useMemo(() => {
    return BUNDLE_TIERS.map((tier) => {
      const baseSubtotal    = currentPrice * tier.qty;
      const bundleDiscount  = baseSubtotal * (tier.offPct / 100);
      const finalPrice      = baseSubtotal - bundleDiscount;

      // Original subtotal (what customer WOULD pay without ANY discount)
      const originalPerUnit = compareAtPrice ?? currentPrice;
      const originalSubtotal = originalPerUnit * tier.qty;

      // Total combined savings % (base sale + bundle discount)
      const totalSavingsPct = originalSubtotal > 0
        ? Math.round(((originalSubtotal - finalPrice) / originalSubtotal) * 100)
        : 0;

      return {
        ...tier,
        finalPrice,
        originalSubtotal,
        totalSavingsPct,
      };
    });
  }, [currentPrice, compareAtPrice]);

  return (
    <div>
      <div className="text-center mb-4">
        <h3 className="text-sm sm:text-base font-bold tracking-[0.15em] uppercase text-[#1a1a1a]">
          Buy More, Save More
        </h3>
      </div>

      <div className="space-y-2.5">
        {tiers.map((tier) => {
          const isSelected = selectedQty === tier.qty;
          const showStrike = tier.originalSubtotal > tier.finalPrice;

          return (
            <button
              key={tier.qty}
              onClick={() => onSelectQty(tier.qty)}
              className={cn(
                "relative w-full text-left border-2 transition-all duration-200 group",
                isSelected
                  ? "border-[#1a1a1a] bg-white shadow-[0_4px_20px_-8px_rgba(26,26,26,0.15)]"
                  : "border-[#e5e7eb] bg-white hover:border-[#1a1a1a]/40"
              )}
              aria-pressed={isSelected}
            >
              {tier.isBest && (
                <span className="absolute -top-2.5 right-4 bg-[#1a1a1a] text-white text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 shadow-sm">
                  Best Value
                </span>
              )}

              <div className="flex items-center gap-3 px-4 py-3.5">
                {/* Radio circle */}
                <div
                  className={cn(
                    "flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center",
                    isSelected ? "border-[#1a1a1a] bg-[#1a1a1a]" : "border-[#d1d5db] group-hover:border-[#1a1a1a]"
                  )}
                >
                  {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                </div>

                {/* Qty + discount pill */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm font-bold text-[#1a1a1a]">
                    Buy {tier.qty}
                  </span>
                  {tier.offPct > 0 && (
                    <span className="text-[10px] font-bold tracking-wider uppercase bg-[#c9a96e]/15 text-[#8a6d3b] px-2 py-0.5">
                      {tier.offPct}% OFF
                    </span>
                  )}
                </div>

                {/* Prices */}
                <div className="text-right flex-shrink-0">
                  <div className="text-sm sm:text-base font-bold text-[#1a1a1a] leading-none">
                    {formatPKR(tier.finalPrice)}
                  </div>
                  {showStrike && (
                    <div className="text-[11px] text-[#9ca3af] line-through mt-1 leading-none">
                      {formatPKR(tier.originalSubtotal)}
                    </div>
                  )}
                  {tier.totalSavingsPct > 0 && (
                    <div className="text-[9px] font-bold text-[#e32c52] tracking-wider uppercase mt-1 leading-none">
                      Save {tier.totalSavingsPct}%
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}