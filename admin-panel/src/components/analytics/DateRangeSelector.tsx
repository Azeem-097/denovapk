"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTransition } from "react";

interface Preset {
  label: string;
  value: string;
  days:  number;
}

const PRESETS: Preset[] = [
  { label: "7 days",   value: "7",   days: 7   },
  { label: "30 days",  value: "30",  days: 30  },
  { label: "90 days",  value: "90",  days: 90  },
  { label: "All time", value: "all", days: 0   },
];

export function DateRangeSelector({ current }: { current: string }) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const setRange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", val);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="bg-white border border-[#e5e7eb] p-3 flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium text-[#6b7280] mr-2">Period:</span>
      {PRESETS.map((p) => {
        const isActive = current === p.value;
        return (
          <button
            key={p.value}
            onClick={() => setRange(p.value)}
            disabled={pending}
            className={cn(
              "px-3 py-1.5 text-xs font-medium border transition-colors",
              isActive
                ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                : "text-[#6b7280] border-[#e5e7eb] hover:text-[#1a1a1a] hover:border-[#1a1a1a]",
              pending && "opacity-60"
            )}
          >
            {p.label}
          </button>
        );
      })}
      {pending && (
        <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-[#E10600]">
          <span className="w-3 h-3 border-2 border-[#E10600] border-t-transparent rounded-full animate-spin" />
          Updating...
        </span>
      )}
    </div>
  );
}