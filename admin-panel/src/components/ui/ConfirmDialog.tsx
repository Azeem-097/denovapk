"use client";
import { useEffect } from "react";
import { AlertTriangle, HelpCircle, Info, X } from "lucide-react";
import { useConfirmStore } from "@/store/confirmStore";

const VARIANT_CONFIG = {
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    button: "bg-red-500 hover:bg-red-600 text-white",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    button: "bg-[#1a1a1a] hover:bg-[#3b5f8f] text-white",
  },
  info: {
    icon: HelpCircle,
    iconBg: "bg-[#f5f0e8]",
    iconColor: "text-[#3b5f8f]",
    button: "bg-[#1a1a1a] hover:bg-[#3b5f8f] text-white",
  },
} as const;

export function ConfirmDialog() {
  const { isOpen, options, handleConfirm, handleCancel } = useConfirmStore();

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
      if (e.key === "Enter")  handleConfirm();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, handleCancel, handleConfirm]);

  if (!isOpen || !options) return null;

  const variant = options.variant ?? "info";
  const cfg     = VARIANT_CONFIG[variant];
  const Icon    = cfg.icon;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="fixed inset-0 z-[95] flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="
            w-full max-w-md bg-white shadow-2xl pointer-events-auto
            animate-in zoom-in-95 fade-in duration-200
          "
        >
          {/* Close */}
          <button
            onClick={handleCancel}
            className="absolute top-3 right-3 p-1.5 text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Body */}
          <div className="p-6">
            <div className="flex gap-4">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
                <Icon size={20} className={cfg.iconColor} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                {options.title && (
                  <h3 className="text-base font-bold text-[#1a1a1a] mb-1.5">
                    {options.title}
                  </h3>
                )}
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  {options.message}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#fafaf9] border-t border-[#e5e7eb]">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] hover:text-[#1a1a1a] border border-[#e5e7eb] hover:border-[#1a1a1a] transition-colors"
            >
              {options.cancelText ?? "Cancel"}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${cfg.button}`}
              autoFocus
            >
              {options.confirmText ?? "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Also handle Info variant icon (silence unused import lint)
void Info;