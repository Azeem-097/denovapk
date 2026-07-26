"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Cake, Gift, Award, Lock } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PromoData {
  activePromo: "birthday" | "first_order" | "loyalty" | null;
  birthday: {
    eligible: boolean;
    discount: number;
    discountText: string;
  };
  firstOrder: {
    eligible: boolean;
    blocked: boolean;
    discount: number;
    discountText: string;
  };
  loyalty: {
    eligible: boolean;
    blocked: boolean;
    blockedBy: string | null;
    points: number;
    canEarn: boolean;
  };
  message: string | null;
}

interface Props {
  subtotal: number;
  onPromoApplied: (promo: {
    type: "birthday" | "first_order" | "loyalty" | null;
    discount: number;
    loyaltyPoints: number;
    canEarnLoyalty: boolean;
  }) => void;
}

export function PromotionBanner({ subtotal, onPromoApplied }: Props) {
  const [data, setData]           = useState<PromoData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [loyaltyInput, setLoyaltyInput]     = useState(0);
  const [loyaltyApplied, setLoyaltyApplied] = useState(false);

  const onPromoAppliedRef = useRef(onPromoApplied);
  useEffect(() => { onPromoAppliedRef.current = onPromoApplied; }, [onPromoApplied]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetch(`/api/promotions/check?subtotal=${subtotal}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (mounted && d) setData(d); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [subtotal]);

  useEffect(() => {
    if (!data) return;

    if (data.activePromo === "birthday") {
      onPromoAppliedRef.current({
        type: "birthday",
        discount: data.birthday.discount,
        loyaltyPoints: 0,
        canEarnLoyalty: false,
      });
    } else if (data.activePromo === "first_order") {
      onPromoAppliedRef.current({
        type: "first_order",
        discount: data.firstOrder.discount,
        loyaltyPoints: 0,
        canEarnLoyalty: false,
      });
    } else if (!loyaltyApplied) {
      onPromoAppliedRef.current({
        type: null,
        discount: 0,
        loyaltyPoints: 0,
        canEarnLoyalty: data.loyalty.canEarn,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleApplyLoyalty = useCallback(() => {
    if (!data || !data.loyalty.eligible) return;

    fetch("/api/loyalty")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d || !d.enabled) return;
        const maxPct = d.settings.maxRedemptionPct;
        const pointValue = d.settings.pointValue;
        const maxDiscount = (subtotal * maxPct) / 100;
        const maxPoints = Math.floor(maxDiscount / pointValue);
        const actual = Math.min(loyaltyInput, maxPoints, d.points);
        if (actual < d.settings.minRedemption) return;

        setLoyaltyApplied(true);
        onPromoAppliedRef.current({
          type: "loyalty",
          discount: actual * pointValue,
          loyaltyPoints: actual,
          canEarnLoyalty: true,
        });
      });
  }, [data, loyaltyInput, subtotal]);

  const handleRemoveLoyalty = useCallback(() => {
    setLoyaltyApplied(false);
    setLoyaltyInput(0);
    onPromoAppliedRef.current({
      type: null,
      discount: 0,
      loyaltyPoints: 0,
      canEarnLoyalty: data?.loyalty.canEarn ?? true,
    });
  }, [data]);

  if (loading || !data) return null;

  // Nothing to show if nothing is happening
  if (
    !data.activePromo &&
    !data.loyalty.eligible &&
    !(data.loyalty.blocked && data.loyalty.points > 0)
  ) {
    return null;
  }

  return (
    <div className="space-y-2">

      {/* BIRTHDAY — subtle cream card, no gradient */}
      {data.activePromo === "birthday" && (
        <div className="rounded-md bg-[#f5f0e8] border border-[#E10600]/30 p-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E10600] flex items-center justify-center flex-shrink-0">
              <Cake size={15} className="text-white" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1a1a1a]">
                🎉 Happy Birthday! {data.birthday.discountText} OFF applied
              </p>
              <p className="text-xs text-[#6b7280] mt-0.5">
                Discount of <span className="font-semibold text-[#E10600]">{formatPrice(data.birthday.discount)}</span> applied automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FIRST ORDER — subtle green card */}
      {data.activePromo === "first_order" && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Gift size={15} className="text-white" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-900">
                🎁 {data.firstOrder.discountText} first order discount applied
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                Saved <span className="font-semibold">{formatPrice(data.firstOrder.discount)}</span> on your first order.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LOYALTY — cream card, tighter design */}
      {data.loyalty.eligible && !data.loyalty.blocked && (
        <div className="rounded-md bg-[#fafaf9] border border-[#e5e7eb] p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <Award size={14} className="text-[#E10600]" />
            <p className="text-xs font-semibold text-[#1a1a1a]">Use loyalty points</p>
            <span className="ml-auto text-xs font-medium text-[#E10600]">
              {data.loyalty.points} pts
            </span>
          </div>

          {loyaltyApplied ? (
            <div className="flex items-center justify-between">
              <p className="text-xs text-green-700">
                {loyaltyInput} pts applied ({formatPrice(loyaltyInput)} off)
              </p>
              <button onClick={handleRemoveLoyalty} className="text-[11px] text-red-500 hover:text-red-700 underline">
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={data.loyalty.points}
                value={loyaltyInput}
                onChange={(e) => setLoyaltyInput(Number(e.target.value))}
                step={10}
                className="w-full accent-[#E10600] h-1"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={data.loyalty.points}
                  value={loyaltyInput}
                  onChange={(e) => setLoyaltyInput(Math.min(Number(e.target.value), data.loyalty.points))}
                  className="w-20 rounded-md px-2 py-1.5 text-xs border border-[#d1d5db] focus:border-[#1a1a1a] focus:outline-none"
                />
                <span className="text-xs text-[#6b7280]">pts</span>
                <span className="ml-auto text-xs font-semibold text-[#E10600]">
                  {formatPrice(loyaltyInput)} off
                </span>
              </div>
              <button
                onClick={handleApplyLoyalty}
                disabled={loyaltyInput < 100}
                className="w-full rounded-md bg-[#1a1a1a] text-white py-2 text-xs font-semibold hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply {loyaltyInput} points
              </button>
            </div>
          )}
        </div>
      )}

      {/* LOYALTY BLOCKED — plain info */}
      {data.loyalty.blocked && data.loyalty.points > 0 && (
        <div className="rounded-md bg-[#fafaf9] border border-[#e5e7eb] p-3 flex items-start gap-2">
          <Lock size={12} className="text-[#6b7280] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#6b7280]">
            You have <span className="font-semibold text-[#E10600]">{data.loyalty.points} loyalty points</span> but they cannot be used on this order because a {data.loyalty.blockedBy === "birthday" ? "birthday" : "first order"} discount is applied.
          </p>
        </div>
      )}
    </div>
  );
}
