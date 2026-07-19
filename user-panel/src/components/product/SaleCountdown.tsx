"use client";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  productId: string;
  className?: string;
}

const MIN_HOURS = 24;
const MAX_HOURS = 48;

function getOrCreateDeadline(productId: string): number {
  if (typeof window === "undefined") return Date.now() + MIN_HOURS * 3_600_000;

  const key = "denova_sale_expires_" + productId;
  const stored = window.localStorage.getItem(key);

  if (stored) {
    const ts = Number(stored);
    if (!isNaN(ts) && ts > Date.now()) return ts;
  }

  const hours    = MIN_HOURS + Math.random() * (MAX_HOURS - MIN_HOURS);
  const deadline = Date.now() + hours * 3_600_000;
  window.localStorage.setItem(key, String(deadline));
  return deadline;
}

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function computeParts(deadline: number): TimeParts {
  const diff = deadline - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const days    = Math.floor(diff / 86_400_000);
  const hours   = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds, expired: false };
}

export function SaleCountdown({ productId, className }: Props) {
  const [mounted,  setMounted]  = useState(false);
  const [deadline, setDeadline] = useState<number>(0);
  const [parts,    setParts]    = useState<TimeParts>({
    days: 0, hours: 0, minutes: 0, seconds: 0, expired: false,
  });

  useEffect(() => {
    setMounted(true);
    setDeadline(getOrCreateDeadline(productId));
  }, [productId]);

  useEffect(() => {
    if (!deadline) return;
    const update = () => {
      const next = computeParts(deadline);
      if (next.expired) {
        const newDeadline = Date.now() + (MIN_HOURS + Math.random() * (MAX_HOURS - MIN_HOURS)) * 3_600_000;
        window.localStorage.setItem("denova_sale_expires_" + productId, String(newDeadline));
        setDeadline(newDeadline);
        setParts(computeParts(newDeadline));
      } else {
        setParts(next);
      }
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [deadline, productId]);

  if (!mounted) {
    return (
      <div
        className={cn(
          "border border-[#e5d3b3] bg-[#fdfbf7] p-3 sm:p-4 mb-6 shadow-[0_4px_20px_-10px_rgba(217,119,6,0.15)]",
          className
        )}
        aria-hidden
      >
        <div className="h-[32px]" />
      </div>
    );
  }

  const cells: Array<{ label: string; value: number }> = [
    { label: "Days",    value: parts.days },
    { label: "Hours",   value: parts.hours },
    { label: "Minutes", value: parts.minutes },
    { label: "Seconds", value: parts.seconds },
  ];

  return (
    <div
      className={cn(
        "w-fit border border-[#e5d3b3] bg-[#fdfbf7] p-3 sm:p-4 mb-6 shadow-[0_4px_20px_-10px_rgba(217,119,6,0.15)]",
        className
      )}
    >
      <div className="flex items-center gap-1.5 mb-2.5">
        <Zap
          size={12}
          strokeWidth={2.5}
          className="text-[#d97706] fill-[#d97706]/20"
        />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#d97706]">
          Sale Ends In
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {cells.map((cell, i) => (
          <div key={cell.label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center min-w-[34px] sm:min-w-[40px]">
              <span className="font-[family-name:var(--font-playfair)] text-base sm:text-lg font-bold text-[#1a1a1a] leading-none tabular-nums">
                {String(cell.value).padStart(2, "0")}
              </span>
              <span className="text-[8px] font-bold tracking-wider uppercase text-[#6b7280] mt-1">
                {cell.label}
              </span>
            </div>
            {i < cells.length - 1 && (
              <span className="text-[#d97706]/50 text-sm font-light leading-none pb-2">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}