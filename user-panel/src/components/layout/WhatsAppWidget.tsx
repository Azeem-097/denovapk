"use client";
import { useEffect, useState, useRef } from "react";
import { MessageCircle, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppConfig {
  enabled:          boolean;
  phone:            string;
  communityLink:    string;
  greeting:         string;
  directLabel:      string;
  communityLabel:   string;
  directSubtext:    string;
  communitySubtext: string;
}

const FALLBACK: WhatsAppConfig = {
  enabled:          false,
  phone:            "",
  communityLink:    "",
  greeting:         "Hi! I'm interested in Denova PK.",
  directLabel:      "Direct Message",
  communityLabel:   "Join Community",
  directSubtext:    "Chat with our support team",
  communitySubtext: "Join our WhatsApp community",
};

const WA_GREEN      = "#25D366";

/**
 * Normalize a phone number for WhatsApp wa.me links.
 * WhatsApp requires the FULL international number WITHOUT the leading + or 00.
 *
 * Handles Pakistani phone formats specifically:
 *   "+923001234567"   -> "923001234567"       (already international)
 *   "923001234567"    -> "923001234567"       (already international, no +)
 *   "03001234567"     -> "923001234567"       (drop 0, prepend 92)
 *   "3001234567"      -> "923001234567"       (10-digit local, prepend 92)
 *   "0092 300 1234567" -> "923001234567"      (00 prefix, drop it, keep 92)
 *
 * If the number already has a valid international format, respect it.
 * Otherwise, assume Pakistan (+92).
 */
export function normalizeWhatsAppPhone(raw: string): string {
  if (!raw) return "";

  // Remove ALL non-digit characters (spaces, dashes, parens, plus signs)
  let digits = raw.replace(/\D/g, "");

  if (!digits) return "";

  // Strip leading "00" (international dialing prefix in some regions)
  if (digits.startsWith("00")) {
    digits = digits.substring(2);
  }

  // If it starts with "92" and total length is 12 (92 + 10-digit number), it's already Pakistan international
  if (digits.startsWith("92") && digits.length === 12) {
    return digits;
  }

  // If it starts with "0" (local Pakistani format like 03001234567), drop the 0 and prepend 92
  if (digits.startsWith("0")) {
    return "92" + digits.substring(1);
  }

  // If it's a 10-digit number (e.g. 3001234567), assume Pakistan mobile → prepend 92
  if (digits.length === 10) {
    return "92" + digits;
  }

  // Fallback: if number already looks international (11+ digits, doesn't start with 0)
  // just use as-is
  return digits;
}

export function WhatsAppWidget() {
  const [config, setConfig]   = useState<WhatsAppConfig | null>(null);
  const [open,   setOpen]     = useState(false);
  const panelRef              = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/whatsapp-widget")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setConfig(data?.config ?? FALLBACK))
      .catch(() => setConfig(FALLBACK));
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  if (!config) return null;
  if (!config.enabled) return null;
  if (!config.phone && !config.communityLink) return null;

  // ── Build direct message link using PROPER normalization ──
  const normalizedPhone = normalizeWhatsAppPhone(config.phone);
  const directLink = normalizedPhone
    ? `https://wa.me/${normalizedPhone}${config.greeting ? `?text=${encodeURIComponent(config.greeting)}` : ""}`
    : "";

  return (
    <div
      ref={panelRef}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40"
    >
      {open && (
        <div
          className="mb-3 w-72 sm:w-80 bg-white shadow-2xl border border-[#e5e7eb] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{ borderRadius: "12px" }}
        >
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{ backgroundColor: WA_GREEN }}
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <WhatsAppIcon size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">Denova PK</p>
              <p className="text-[11px] text-white/80 leading-tight mt-0.5">
                Typically replies within an hour
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-3 space-y-2 bg-[#fafaf9]">
            {directLink && (
              <a
                href={directLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-3 bg-white hover:bg-[#f5f0e8] transition-colors group"
                style={{ borderRadius: "10px" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${WA_GREEN}20` }}
                >
                  <MessageCircle size={18} style={{ color: WA_GREEN }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                    {config.directLabel || "Direct Message"}
                  </p>
                  <p className="text-[11px] text-[#6b7280] truncate">
                    {config.directSubtext || "Chat with our support team"}
                  </p>
                </div>
                <span className="text-[#E10600] opacity-0 group-hover:opacity-100 transition-opacity">
                  &rarr;
                </span>
              </a>
            )}

            {config.communityLink && (
              <a
                href={config.communityLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-3 bg-white hover:bg-[#f5f0e8] transition-colors group"
                style={{ borderRadius: "10px" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${WA_GREEN}20` }}
                >
                  <Users size={18} style={{ color: WA_GREEN }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                    {config.communityLabel || "Join Community"}
                  </p>
                  <p className="text-[11px] text-[#6b7280] truncate">
                    {config.communitySubtext || "Join our WhatsApp community"}
                  </p>
                </div>
                <span className="text-[#E10600] opacity-0 group-hover:opacity-100 transition-opacity">
                  &rarr;
                </span>
              </a>
            )}

            <p className="text-center text-[10px] text-[#6b7280] pt-2">
              Powered by WhatsApp
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
          "hover:scale-110 active:scale-95",
          open && "rotate-90"
        )}
        style={{
          backgroundColor: WA_GREEN,
          boxShadow: `0 8px 24px rgba(37, 211, 102, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)`,
        }}
        aria-label={open ? "Close WhatsApp menu" : "Contact us on WhatsApp"}
      >
        {open ? (
          <X size={24} className="text-white" />
        ) : (
          <WhatsAppIcon size={26} className="text-white" />
        )}

        {!open && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: WA_GREEN }}
          />
        )}
      </button>
    </div>
  );
}

function WhatsAppIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.138.564 4.14 1.545 5.873L.057 23.997l6.306-1.654A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.017-1.376l-.36-.214-3.733.979 1-3.646-.234-.374A9.818 9.818 0 0 1 12 2.182c5.427 0 9.818 4.391 9.818 9.818 0 5.428-4.391 9.818-9.818 9.818z"/>
    </svg>
  );
}