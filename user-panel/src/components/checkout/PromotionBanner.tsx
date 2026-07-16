"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Cake, Gift, Award, Info, Check, Lock } from "lucide-react";
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
  const [data, setData]         = useState<PromoData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [loyaltyInput, setLoyaltyInput] = useState(0);
  const [loyaltyApplied, setLoyaltyApplied] = useState(false);

  const onPromoAppliedRef = useRef(onPromoApplied);
  useEffect(() => { onPromoAppliedRef.current = onPromoApplied; }, [onPromoApplied]);

  // Fetch promotion status
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    console.log("[PromotionBanner] Fetching promotions for subtotal:", subtotal);

    fetch(`/api/promotions/check?subtotal=${subtotal}`)
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`API returned ${r.status}: ${text}`);
        }
        return r.json();
      })
      .then((d) => {
        if (mounted) {
          console.log("[PromotionBanner] API response:", d);
          setData(d);
        }
      })
      .catch((err) => {
        console.error("[PromotionBanner] API error:", err);
        if (mounted) setError(err.message);
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [subtotal]);

  // Apply auto-promotions
  useEffect(() => {
    if (!data) return;

    console.log("[PromotionBanner] Active promo:", data.activePromo);

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

  // Show loading spinner briefly
  if (loading) {
    return (
      <div className="border border-[#e5e7eb] bg-[#fafaf9] p-4 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#6b7280]">Checking available promotions...</p>
      </div>
    );
  }

  // Show error if API failed
  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 p-4 text-xs text-red-600">
        <p className="font-semibold">Promotion check failed</p>
        <p className="mt-1 font-mono">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-3">

      {/* BIRTHDAY DISCOUNT */}
      {data.activePromo === "birthday" && (
        <div className="border-2 border-[#c9a96e] bg-gradient-to-r from-[#f5f0e8] to-[#f5f0e8]/50 p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <Cake size={80} className="text-[#c9a96e] -mt-2 -mr-2" />
          </div>
          <div className="relative flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#c9a96e] flex items-center justify-center flex-shrink-0">
              <Cake size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#1a1a1a]">
                🎉 Happy Birthday! {data.birthday.discountText} OFF applied!
              </p>
              <p className="text-xs text-[#6b7280] mt-1">
                Discount of <span className="font-semibold text-[#c9a96e]">{formatPrice(data.birthday.discount)}</span> applied automatically.
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#6b7280] bg-white/60 px-2 py-1 w-fit">
                <Lock size={10} />
                Loyalty rewards not available on birthday orders
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIRST ORDER DISCOUNT */}
      {data.activePromo === "first_order" && (
        <div className="border-2 border-green-400 bg-gradient-to-r from-green-50 to-green-50/50 p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <Gift size={80} className="text-green-500 -mt-2 -mr-2" />
          </div>
          <div className="relative flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Gift size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-900">
                🎁 Welcome! {data.firstOrder.discountText} First Order Discount!
              </p>
              <p className="text-xs text-green-700 mt-1">
                Your first order discount of <span className="font-semibold">{formatPrice(data.firstOrder.discount)}</span> has been applied automatically.
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-green-600 bg-white/60 px-2 py-1 w-fit">
                <Info size={10} />
                Loyalty rewards are not available on your first order
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOYALTY POINTS */}
      {data.loyalty.eligible && !data.loyalty.blocked && (
        <div className="border border-[#c9a96e]/30 bg-[#f5f0e8]/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award size={18} className="text-[#c9a96e]" />
            <h3 className="text-sm font-bold text-[#1a1a1a]">Use Loyalty Points</h3>
            <span className="text-xs text-[#c9a96e] font-semibold ml-auto">
              {data.loyalty.points} pts
            </span>
          </div>

          {loyaltyApplied ? (
            <div className="bg-white border border-green-200 p-3 flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <p className="text-sm font-semibold text-green-800 flex-1">
                {loyaltyInput} points applied ({formatPrice(loyaltyInput)} discount)
              </p>
              <button onClick={handleRemoveLoyalty} className="text-xs text-red-500 hover:text-red-700 underline">Remove</button>
            </div>
          ) : (
            <div className="space-y-2">
              <input type="range" min={0} max={data.loyalty.points} value={loyaltyInput}
                onChange={(e) => setLoyaltyInput(Number(e.target.value))} step={10}
                className="w-full accent-[#c9a96e]" />
              <div className="flex items-center gap-2">
                <input type="number" min={0} max={data.loyalty.points} value={loyaltyInput}
                  onChange={(e) => setLoyaltyInput(Math.min(Number(e.target.value), data.loyalty.points))}
                  className="w-24 px-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none" />
                <span className="text-sm text-[#6b7280]">pts</span>
                <span className="text-sm text-[#c9a96e] font-semibold ml-auto">= {formatPrice(loyaltyInput)}</span>
              </div>
              <button onClick={handleApplyLoyalty} disabled={loyaltyInput < 100}
                className="w-full bg-[#1a1a1a] text-white py-2.5 text-sm font-semibold hover:bg-[#c9a96e] transition-colors disabled:opacity-50">
                Apply {loyaltyInput} Points
              </button>
            </div>
          )}
        </div>
      )}

      {/* LOYALTY BLOCKED */}
      {data.loyalty.blocked && data.loyalty.points > 0 && (
        <div className="border border-[#e5e7eb] bg-[#fafaf9] p-3 flex items-start gap-2">
          <Lock size={13} className="text-[#6b7280] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#6b7280]">
            You have <span className="font-semibold text-[#c9a96e]">{data.loyalty.points} loyalty points</span> but they
            cannot be used on this order because a {data.loyalty.blockedBy === "birthday" ? "birthday" : "first order"} discount is applied.
          </p>
        </div>
      )}

      {/* NO PROMO + NO POINTS */}
      {!data.activePromo && data.loyalty.points === 0 && !data.loyalty.blocked && (
        <div className="border border-[#e5e7eb] bg-[#fafaf9] p-3 flex items-start gap-2">
          <Award size={13} className="text-[#c9a96e] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#6b7280]">
            Complete this order to start earning loyalty points!
          </p>
        </div>
      )}

      {/* NO PROMO AVAILABLE (user not logged in or no eligible promo) */}
      {!data.activePromo && !data.loyalty.eligible && !data.loyalty.blocked && data.loyalty.points === 0 && (
        <div className="border border-[#e5e7eb] bg-[#fafaf9] p-3 flex items-start gap-2">
          <Info size={13} className="text-[#6b7280] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#6b7280]">
            No promotions available for this order.
          </p>
        </div>
      )}
    </div>
  );
}