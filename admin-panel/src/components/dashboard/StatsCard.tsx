import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title:      string;
  value:      string;
  change?:    number;
  changeLabel?: string;
  icon:       React.ComponentType<{ size?: number; className?: string }>;
  iconBg?:    string;
  className?: string;
}

export function StatsCard({
  title, value, change, changeLabel = "vs last month",
  icon: Icon, iconBg = "bg-[#f5f0e8]", className,
}: StatsCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className={cn(
      "bg-white border border-[#e5e7eb] p-5 lg:p-6",
      className
    )}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0", iconBg)}>
          <Icon size={20} className="text-[#3b5f8f]" />
        </div>
        {change !== undefined && (
          <div className={cn(
            "inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
            isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <p className="text-2xl lg:text-3xl font-bold text-[#1a1a1a] mb-1">
        {value}
      </p>
      <p className="text-xs text-[#6b7280] font-medium uppercase tracking-wide">
        {title}
      </p>
      {change !== undefined && (
        <p className="text-[11px] text-[#6b7280] mt-1">
          {isPositive ? "+" : ""}{change}% {changeLabel}
        </p>
      )}
    </div>
  );
}