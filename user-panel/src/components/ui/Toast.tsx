"use client";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 bg-white border shadow-lg p-4 pr-3 min-w-[280px]",
            "animate-in slide-in-from-right-4 duration-300",
            t.type === "success" && "border-l-4 border-l-[#E10600] border-t border-r border-b border-[#e5e7eb]",
            t.type === "error"   && "border-l-4 border-l-red-500 border-t border-r border-b border-[#e5e7eb]",
            t.type === "info"    && "border-l-4 border-l-[#1a1a1a] border-t border-r border-b border-[#e5e7eb]"
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {t.type === "success" && <CheckCircle size={18} className="text-[#E10600]" />}
            {t.type === "error"   && <AlertCircle size={18} className="text-red-500" />}
            {t.type === "info"    && <Info size={18} className="text-[#1a1a1a]" />}
          </div>

          <p className="flex-1 text-sm text-[#1a1a1a] font-medium leading-snug">
            {t.message}
          </p>

          <button
            onClick={() => removeToast(t.id)}
            className="flex-shrink-0 text-[#6b7280] hover:text-[#1a1a1a] transition-colors -mt-0.5"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}