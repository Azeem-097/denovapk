"use client";
import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore, type Toast, type ToastType } from "@/store/toastStore";

const CONFIG: Record<ToastType, {
  icon: typeof CheckCircle;
  accent: string;
  iconColor: string;
  bgTint: string;
}> = {
  success: {
    icon: CheckCircle,
    accent: "border-l-[#E10600]",
    iconColor: "text-[#E10600]",
    bgTint: "bg-[#f5f0e8]/30",
  },
  error: {
    icon: AlertCircle,
    accent: "border-l-red-500",
    iconColor: "text-red-500",
    bgTint: "bg-red-50/50",
  },
  warning: {
    icon: AlertTriangle,
    accent: "border-l-orange-500",
    iconColor: "text-orange-500",
    bgTint: "bg-orange-50/50",
  },
  info: {
    icon: Info,
    accent: "border-l-[#1a1a1a]",
    iconColor: "text-[#1a1a1a]",
    bgTint: "bg-[#fafaf9]",
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm w-full"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  const cfg = CONFIG[toast.type];
  const Icon = cfg.icon;

  useEffect(() => {
    // trigger slide-in on mount
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 200);
  };

  return (
    <div
      className={`
        pointer-events-auto relative overflow-hidden
        bg-white border border-[#e5e7eb] border-l-4 ${cfg.accent}
        shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)]
        transition-all duration-300 ease-out
        ${visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}
      `}
    >
      <div className={`${cfg.bgTint} px-4 py-3.5 pr-9`}>
        <div className="flex items-start gap-3">
          <Icon size={18} className={`${cfg.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            {toast.title && (
              <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-0.5">
                {toast.title}
              </p>
            )}
            <p className="text-sm text-[#1a1a1a] leading-snug">
              {toast.message}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e5e7eb]/50">
          <div
            className={`h-full ${cfg.iconColor.replace("text-", "bg-")} origin-left`}
            style={{
              animation: `denova-toast-progress ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes denova-toast-progress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}