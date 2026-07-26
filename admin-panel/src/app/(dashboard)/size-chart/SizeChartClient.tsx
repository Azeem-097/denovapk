"use client";
import { useState } from "react";
import { Ruler, Plus, Trash2, Save, Loader, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/store/toastStore";
import type { SizeChartConfig, SizeChartRow } from "./page";

interface Props {
  initialConfig: SizeChartConfig;
}

function emptyRow(): SizeChartRow {
  return { size: "", waist: "", hip: "", thigh: "", length: "" };
}

export function SizeChartClient({ initialConfig }: Props) {
  const [config, setConfig] = useState<SizeChartConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [dirty,  setDirty]  = useState(false);
  const toast = useToastStore();

  const updateField = <K extends keyof SizeChartConfig>(key: K, value: SizeChartConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const updateRow = (i: number, field: keyof SizeChartRow, value: string) => {
    setConfig((prev) => ({
      ...prev,
      rows: prev.rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r),
    }));
    setDirty(true);
  };

  const addRow = () => {
    setConfig((prev) => ({ ...prev, rows: [...prev.rows, emptyRow()] }));
    setDirty(true);
  };

  const removeRow = (i: number) => {
    setConfig((prev) => ({ ...prev, rows: prev.rows.filter((_, idx) => idx !== i) }));
    setDirty(true);
  };

  const moveRow = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= config.rows.length) return;
    const rows = [...config.rows];
    [rows[i], rows[j]] = [rows[j], rows[i]];
    setConfig((prev) => ({ ...prev, rows }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/size-chart", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ config }),
      });
      if (res.ok) {
        setDirty(false);
        toast.success("Size chart saved successfully!", "Saved");
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to save");
      }
    } catch {
      toast.error("Network error - could not save");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl space-y-5">

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <Ruler size={22} className="text-[#E10600]" />
            Size Chart
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Manage the size chart shown to customers on every product page.
          </p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={saving || !dirty}>
          {saving
            ? <><Loader size={14} className="animate-spin" />Saving...</>
            : <><Save size={14} />{dirty ? "Save Changes" : "Saved"}</>
          }
        </Button>
      </div>

      {/* Intro text */}
      <div className="bg-white border border-[#e5e7eb] p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
            Intro Text
          </label>
          <textarea
            value={config.intro}
            onChange={(e) => updateField("intro", e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none resize-y"
            placeholder="e.g. All measurements are in inches..."
          />
          <p className="mt-1 text-[10px] text-[#6b7280]">Shown at the top of the size chart modal.</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
            Footer Note (How to measure)
          </label>
          <textarea
            value={config.footerNote}
            onChange={(e) => updateField("footerNote", e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none resize-y"
            placeholder="e.g. How to measure: Use a soft measuring tape..."
          />
          <p className="mt-1 text-[10px] text-[#6b7280]">Shown at the bottom in a gold accent box.</p>
        </div>
      </div>

      {/* Rows */}
      <div className="bg-white border border-[#e5e7eb]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
          <h2 className="text-sm font-bold text-[#1a1a1a]">Size Rows ({config.rows.length})</h2>
          <button
            onClick={addRow}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E10600] hover:text-[#B80000]"
          >
            <Plus size={14} />Add Row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#fafaf9] border-b border-[#e5e7eb]">
                <th className="w-8 px-2 py-2.5"></th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[#6b7280] w-24">Size</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Waist (in)</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Hip (in)</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Thigh (in)</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Length (in)</th>
                <th className="w-24 px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {config.rows.map((row, i) => (
                <tr key={i} className="hover:bg-[#fafaf9]/50">
                  <td className="px-2 py-2 align-middle">
                    <div className="flex flex-col items-center gap-0.5 text-[#9ca3af]">
                      <GripVertical size={12} />
                      <span className="text-[9px] font-bold">{i + 1}</span>
                    </div>
                  </td>
                  {(["size", "waist", "hip", "thigh", "length"] as const).map((f) => (
                    <td key={f} className="px-3 py-2">
                      <input
                        type="text"
                        value={row[f]}
                        onChange={(e) => updateRow(i, f, e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none"
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => moveRow(i, -1)}
                        disabled={i === 0}
                        className="p-1 text-[#6b7280] hover:text-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveRow(i, 1)}
                        disabled={i === config.rows.length - 1}
                        className="p-1 text-[#6b7280] hover:text-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => removeRow(i)}
                        className="p-1 text-[#6b7280] hover:text-red-500"
                        title="Remove row"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {config.rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-sm text-[#6b7280]">
                    No rows yet. Click <strong>Add Row</strong> to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky save bar */}
      {dirty && (
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 bg-white border-t border-[#e5e7eb] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-end gap-3 z-10">
          <p className="text-xs text-[#6b7280] mr-auto">You have unsaved changes</p>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving
              ? <><Loader size={14} className="animate-spin" />Saving...</>
              : <><Save size={14} />Save Changes</>
            }
          </Button>
        </div>
      )}

      <p className="text-[11px] text-[#6b7280] italic text-center">
        Changes take effect immediately on the storefront (60-second cache).
      </p>
    </div>
  );
}