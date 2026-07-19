"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Ruler, Loader } from "lucide-react";

interface SizeChartRow {
  size:   string;
  waist:  string;
  hip:    string;
  thigh:  string;
  length: string;
}

interface SizeChartConfig {
  intro:      string;
  footerNote: string;
  rows:       SizeChartRow[];
}

const FALLBACK: SizeChartConfig = {
  intro:      "All measurements are in inches. Sizes may vary slightly between brands and styles. When in doubt, size up.",
  footerNote: "How to measure: Use a soft measuring tape. For waist, measure around the narrowest part of your torso. For hip, measure around the fullest part of your hips.",
  rows: [
    { size: "28", waist: "28", hip: "35", thigh: "21", length: "30" },
    { size: "30", waist: "30", hip: "37", thigh: "22", length: "30" },
    { size: "32", waist: "32", hip: "39", thigh: "23", length: "32" },
    { size: "34", waist: "34", hip: "41", thigh: "24", length: "32" },
    { size: "36", waist: "36", hip: "43", thigh: "25", length: "32" },
    { size: "38", waist: "38", hip: "45", thigh: "26", length: "34" },
    { size: "40", waist: "40", hip: "47", thigh: "27", length: "34" },
  ],
};

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

export function SizeChartModal({ isOpen, onClose }: Props) {
  const [config, setConfig] = useState<SizeChartConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || config) return;
    setLoading(true);
    fetch("/api/size-chart")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        setConfig(data?.config ?? FALLBACK);
        setLoading(false);
      })
      .catch(() => {
        setConfig(FALLBACK);
        setLoading(false);
      });
  }, [isOpen, config]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (typeof window === "undefined" || !isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-white shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2">
            <Ruler size={16} className="text-[#c9a96e]" />
            <h3 className="text-sm font-bold tracking-[0.15em] uppercase text-[#1a1a1a]">
              Size Chart (inches)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading || !config ? (
            <div className="py-16 flex flex-col items-center gap-2 text-[#6b7280]">
              <Loader size={20} className="animate-spin" />
              <span className="text-xs">Loading size chart...</span>
            </div>
          ) : (
            <>
              {config.intro && (
                <p className="text-xs text-[#6b7280] mb-4 leading-relaxed">{config.intro}</p>
              )}

              <div className="border border-[#e5e7eb] overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#fafaf9] border-b border-[#e5e7eb]">
                      <th className="px-3 py-3 text-left text-[10px] font-bold tracking-widest uppercase text-[#6b7280]">Size</th>
                      <th className="px-3 py-3 text-center text-[10px] font-bold tracking-widest uppercase text-[#6b7280]">Waist</th>
                      <th className="px-3 py-3 text-center text-[10px] font-bold tracking-widest uppercase text-[#6b7280]">Hip</th>
                      <th className="px-3 py-3 text-center text-[10px] font-bold tracking-widest uppercase text-[#6b7280]">Thigh</th>
                      <th className="px-3 py-3 text-center text-[10px] font-bold tracking-widest uppercase text-[#6b7280]">Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {config.rows.map((r, i) => (
                      <tr key={r.size + i} className="hover:bg-[#fafaf9] transition-colors">
                        <td className="px-3 py-3 text-sm font-bold text-[#1a1a1a]">{r.size}</td>
                        <td className="px-3 py-3 text-center text-sm text-[#1a1a1a]">{r.waist}&quot;</td>
                        <td className="px-3 py-3 text-center text-sm text-[#1a1a1a]">{r.hip}&quot;</td>
                        <td className="px-3 py-3 text-center text-sm text-[#1a1a1a]">{r.thigh}&quot;</td>
                        <td className="px-3 py-3 text-center text-sm text-[#1a1a1a]">{r.length}&quot;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {config.footerNote && (
                <div className="mt-4 p-3 bg-[#f5f0e8]/40 border border-[#c9a96e]/25 text-xs text-[#1a1a1a] leading-relaxed">
                  {config.footerNote}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}