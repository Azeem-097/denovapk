import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items:     BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight size={12} className="text-[#6b7280] flex-shrink-0" />
            )}
            {isLast || !item.href ? (
              <span
                className={cn(
                  "text-xs tracking-wide",
                  isLast
                    ? "text-[#1a1a1a] font-medium"
                    : "text-[#6b7280]"
                )}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-xs text-[#6b7280] hover:text-[#F97316] transition-colors tracking-wide"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}