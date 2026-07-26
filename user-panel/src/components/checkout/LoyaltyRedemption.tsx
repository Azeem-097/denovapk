"use client";
import { useEffect, useState, useRef } from "react";
import { Award, Check, Info } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface LoyaltyData {
  enabled:  boolean;
  points:   number;
  settings: {
    pointValue:        number;
    minRedemption:     number;
    maxRedemptionPct:  number;
    programName:       string;
  };
}

interface Props {
  subtotal:      number;
  onRedeem:      (points: number, discount: number) => void;
  currentPoints: number;
}

export function LoyaltyRedemption({ subtotal, onRedeem, currentPoints }: Props) {
  const [data,        setData]        = useState<LoyaltyData | null>(null);
  const [pointsInput, setPointsInput] = useState(currentPoints || 0);
  const [loading,     setLoading]     = useState(true);
  const [applied,     setApplied]     = useState(currentPoints > 0);
  const [error,       setError]       = useState("");
  const [maxAllowed,  setMaxAllowed]  = useState(0);

  // ─── Fix: Store callback in ref ─────────────────────────
  const onRedeemRef = useRef(onRedeem);
  useEffect(() => {
    onRedeemRef.current = onRedeem;
  }, [onRedeem]);

  // Fetch loyalty data ONCE on mount
  useEffect(() => {
    let mounted = true;
    fetch("/api/loyalty")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!mounted) return;
        if (d && d.enabled) {
          setData(d);
          const max = Math.floor((subtotal * d.settings.maxRedemptionPct / 100) / d.settings.pointValue);
          setMaxAllowed(Math.min(max, d.points));
        }
      })
      .finally(() => { if (mounted) setLoading(false); })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalculate max when subtotal changes (does NOT call parent)
  useEffect(() => {
    if (data) {
      const max = Math.floor((subtotal * data.settings.maxRedemptionPct / 100) / data.settings.pointValue);
      const newMax = Math.min(max, data.points);
      setMaxAllowed(newMax);
      if (pointsInput > newMax) {
        setPointsInput(newMax);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, data]);

  const handleApply = () => {
    if (!data) return;

    const points = pointsInput;

    if (points < data.settings.minRedemption) {
      setError(`Minimum ${data.settings.minRedemption} points required`);
      return;
    }

    if (points > data.points) {
      setError(`You only have ${data.points} points`);
      return;
    }

    if (points > maxAllowed) {
      setError(`Max ${maxAllowed} points can be used on this order`);
      return;
    }

    const discount = points * data.settings.pointValue;
    onRedeemRef.current(points, discount);
    setApplied(true);
    setError("");
  };

  const handleRemove = () => {
    onRedeemRef.current(0, 0);
    setApplied(false);
    setPointsInput(0);
  };

  if (loading || !data || !data.enabled) return null;

  if (data.points === 0) {
    return (
      <div className="border border-[#e5e7eb] bg-[#fafaf9] p-4 flex items-start gap-3">
        <Award size={18} className="text-[#E10600] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#1a1a1a]">You have 0 loyalty points</p>
          <p className="text-xs text-[#6b7280] mt-1">Complete this order to start earning {data.settings.programName} points!</p>
        </div>
      </div>
    );
  }

  if (data.points < data.settings.minRedemption) {
    return (
      <div className="border border-[#e5e7eb] bg-[#fafaf9] p-4 flex items-start gap-3">
        <Award size={18} className="text-[#E10600] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#1a1a1a]">You have {data.points} points</p>
          <p className="text-xs text-[#6b7280] mt-1">
            Need {data.settings.minRedemption - data.points} more points to redeem.
            Complete more orders to earn!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#E10600]/30 bg-[#f5f0e8]/50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Award size={18} className="text-[#E10600]" />
        <h3 className="text-sm font-bold text-[#1a1a1a]">Use Loyalty Points</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#6b7280]">Your Balance</p>
          <p className="text-lg font-bold text-[#E10600]">{data.points} pts</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#6b7280]">Max This Order</p>
          <p className="text-lg font-bold text-[#1a1a1a]">{maxAllowed} pts</p>
        </div>
      </div>

      {applied ? (
        <div className="bg-white border border-green-200 p-3 flex items-center gap-2">
          <Check size={16} className="text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">
              {currentPoints} points applied ({formatPrice(currentPoints * data.settings.pointValue)} discount)
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={maxAllowed}
              value={pointsInput}
              onChange={(e) => { setPointsInput(Number(e.target.value)); setError(""); }}
              step={10}
              className="w-full accent-[#E10600]"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={maxAllowed}
                value={pointsInput}
                onChange={(e) => { setPointsInput(Math.min(Number(e.target.value), maxAllowed)); setError(""); }}
                className="w-24 px-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none"
              />
              <span className="text-sm text-[#6b7280]">points</span>
              <span className="text-sm text-[#E10600] font-semibold ml-auto">
                = {formatPrice(pointsInput * data.settings.pointValue)}
              </span>
            </div>

            <button
              onClick={handleApply}
              disabled={pointsInput < data.settings.minRedemption}
              className="w-full mt-2 bg-[#1a1a1a] text-white py-2.5 text-sm font-semibold hover:bg-[#E10600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply {pointsInput} Points
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>
          )}

          <p className="mt-3 text-[11px] text-[#6b7280] flex items-start gap-1.5">
            <Info size={11} className="flex-shrink-0 mt-0.5" />
            <span>
              Redeem your points for a discount. Minimum {data.settings.minRedemption} points.
              Max {data.settings.maxRedemptionPct}% of order.
            </span>
          </p>
        </>
      )}
    </div>
  );
}