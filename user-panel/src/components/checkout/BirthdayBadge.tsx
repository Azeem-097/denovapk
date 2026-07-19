"use client";
import { useEffect, useState, useRef } from "react";
import { Cake, Gift, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Props {
  subtotal: number;
  onDiscountApplied: (discount: number, isEligible: boolean) => void;
}

interface BirthdayCheck {
  eligible:     boolean;
  discountPct?: number;
  fixedAmount?: number;
  minOrder?:    number;
}

export function BirthdayBadge({ subtotal, onDiscountApplied }: Props) {
  const [check, setCheck]     = useState<BirthdayCheck | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Fix: Store callback in ref to avoid dependency loop ─
  const onDiscountAppliedRef = useRef(onDiscountApplied);
  useEffect(() => {
    onDiscountAppliedRef.current = onDiscountApplied;
  }, [onDiscountApplied]);

  // Fetch birthday check ONCE on mount
  useEffect(() => {
    let mounted = true;
    fetch("/api/birthday/check")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (mounted) setCheck(data); })
      .finally(() => { if (mounted) setLoading(false); })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Calculate + apply discount when subtotal or eligibility changes
  useEffect(() => {
    if (!check) return;

    if (!check.eligible) {
      onDiscountAppliedRef.current(0, false);
      return;
    }

    // Check minimum order
    if (check.minOrder && subtotal < check.minOrder) {
      onDiscountAppliedRef.current(0, true); // Eligible but doesn't meet min
      return;
    }

    // Calculate discount
    let discount = 0;
    if (check.fixedAmount && check.fixedAmount > 0) {
      discount = check.fixedAmount;
    } else if (check.discountPct && check.discountPct > 0) {
      discount = Math.round((subtotal * check.discountPct) / 100);
    }

    onDiscountAppliedRef.current(discount, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [check, subtotal]);

  if (loading || !check?.eligible) return null;

  const minOrder = check.minOrder ?? 0;
  const meetsMin = subtotal >= minOrder;

  return (
    <div className="border-2 border-[#3b5f8f] bg-gradient-to-r from-[#f5f0e8] to-[#f5f0e8]/50 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-10">
        <Cake size={100} className="text-[#3b5f8f] -mt-2 -mr-2" />
      </div>

      <div className="relative flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-[#3b5f8f] flex items-center justify-center flex-shrink-0">
          {meetsMin ? (
            <CheckCircle size={20} className="text-white" />
          ) : (
            <Gift size={20} className="text-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1a1a1a] flex items-center gap-1.5">
            🎉 Happy Birthday!
          </p>

          {meetsMin ? (
            <p className="text-sm text-[#3b5f8f] font-semibold mt-1">
              Your{" "}
              {check.fixedAmount && check.fixedAmount > 0
                ? formatPrice(check.fixedAmount)
                : `${check.discountPct}%`}
              {" "}birthday discount has been applied!
            </p>
          ) : (
            <p className="text-sm text-[#6b7280] mt-1">
              You qualify for a{" "}
              <span className="font-semibold text-[#3b5f8f]">
                {check.fixedAmount && check.fixedAmount > 0
                  ? formatPrice(check.fixedAmount)
                  : `${check.discountPct}%`}
              </span>{" "}
              birthday discount! Add {formatPrice(minOrder - subtotal)} more to unlock it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}