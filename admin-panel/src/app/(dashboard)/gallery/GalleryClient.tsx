"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Image as ImageIcon, Edit, Trash2, Eye, EyeOff,
  Save, Loader, X, Info, Link as LinkIcon, Upload,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/store/toastStore";

// ─── Types ───────────────────────────────────────────────
interface GallerySlot {
  id:       string;
  image:    string;
  link:     string;
  isActive: boolean;
}

interface GalleryConfig {
  enabled:            boolean;
  sectionLabel:       string;
  sectionTitle:       string;
  sectionDescription: string;
  slots:              GallerySlot[];
}

// ─── Upload helper ───────────────────────────────────────
async function uploadImage(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("type", "banner");
  const res  = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  return res.ok ? data.image.url : null;
}

async function uploadImageFromUrl(url: string): Promise<string | null> {
  const res = await fetch("/api/upload", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ url, type: "banner" }),
  });
  const data = await res.json();
  return res.ok ? data.image.url : url;
}

// ─── Props ───────────────────────────────────────────────
interface Props {
  initialConfig: GalleryConfig;
}

// Slot labels (for UI clarity)
const SLOT_LABELS = ["Top Left", "Bottom Left", "Center (Tall)", "Top Right", "Bottom Right"];

// ══════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════
export function GalleryClient({ initialConfig }: Props) {
  const [config,     setConfig]     = useState<GalleryConfig>(initialConfig);
  const [saving,     setSaving]     = useState(false);
  const [dirty,      setDirty]      = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const toast = useToastStore();

  // ── Update helpers ────────────────────────────────────
  const updateConfig = <K extends keyof GalleryConfig>(key: K, value: GalleryConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const updateSlot = (idx: number, changes: Partial<GallerySlot>) => {
    setConfig((prev) => ({
      ...prev,
      slots: prev.slots.map((s, i) => i === idx ? { ...s, ...changes } : s),
    }));
    setDirty(true);
  };

  // ── Save ──────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/gallery", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ config }),
      });

      if (res.ok) {
        setDirty(false);
        toast.success("Gallery saved successfully!", "Saved");
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
    <div className="max-w-6xl space-y-5">

      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <LayoutGrid size={22} className="text-[#c9a96e]" />
            Gallery Section
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Manage the &quot;Style in Action&quot; gallery on your homepage.
          </p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={saving || !dirty}>
          {saving
            ? <><Loader size={14} className="animate-spin" />Saving...</>
            : <><Save size={14} />{dirty ? "Save Changes" : "Saved"}</>
          }
        </Button>
      </div>

      {/* ── Section Text Settings ─────────────────────── */}
      <div className="bg-white border border-[#e5e7eb] p-5 space-y-4">
        <h2 className="text-base font-bold text-[#1a1a1a]">Section Text</h2>

        {/* Enabled toggle */}
        <label className={cn(
          "flex items-center gap-3 p-3 border cursor-pointer transition-colors",
          config.enabled ? "bg-[#f5f0e8]/40 border-[#c9a96e]" : "bg-[#fafaf9] border-[#e5e7eb]"
        )}>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => updateConfig("enabled", e.target.checked)}
            className="w-4 h-4 accent-[#c9a96e]"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a1a1a] flex items-center gap-1.5">
              {config.enabled
                ? <><Eye size={13} className="text-[#c9a96e]" />Section visible on homepage</>
                : <><EyeOff size={13} className="text-[#6b7280]" />Section hidden from homepage</>
              }
            </p>
          </div>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
              Small Label (above title)
            </label>
            <input
              type="text"
              value={config.sectionLabel}
              onChange={(e) => updateConfig("sectionLabel", e.target.value)}
              placeholder="e.g. @denovapk"
              className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={config.sectionTitle}
              onChange={(e) => updateConfig("sectionTitle", e.target.value)}
              placeholder="e.g. Style in Action"
              className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
            Description
          </label>
          <textarea
            value={config.sectionDescription}
            onChange={(e) => updateConfig("sectionDescription", e.target.value)}
            placeholder="e.g. Follow us for daily style inspiration..."
            rows={2}
            className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none resize-y"
          />
        </div>
      </div>

      {/* ── Info banner ───────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
        <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <p className="font-semibold mb-1">Layout</p>
          <p>
            5 slots in a fixed premium layout. Center slot is <strong>tall</strong> (2x height).
            Click any slot to upload/replace image, add a link, or toggle visibility.
            Empty slots will show a subtle placeholder on the user site.
          </p>
        </div>
      </div>

      {/* ── Visual Layout Preview ────────────────────── */}
      <div className="bg-white border border-[#e5e7eb] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#1a1a1a]">Gallery Layout</h2>
          <p className="text-xs text-[#6b7280]">Click any slot to edit</p>
        </div>

        {/*
          Layout:
          ┌───┬─────────┬───┐
          │ 1 │         │ 4 │
          ├───┤    3    ├───┤
          │ 2 │  tall   │ 5 │
          └───┴─────────┴───┘
        */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {/* Slot 1: top-left */}
          <SlotCard
            slot={config.slots[0]} index={0} label={SLOT_LABELS[0]}
            aspectClass="aspect-square"
            gridClass=""
            onEdit={() => setEditingIdx(0)}
            onToggle={() => updateSlot(0, { isActive: !config.slots[0].isActive })}
          />

          {/* Slot 3: center tall — spans 2 rows */}
          <SlotCard
            slot={config.slots[2]} index={2} label={SLOT_LABELS[2]}
            aspectClass=""
            gridClass="col-span-2 sm:col-span-2 row-span-2 aspect-[2/1] sm:aspect-auto"
            onEdit={() => setEditingIdx(2)}
            onToggle={() => updateSlot(2, { isActive: !config.slots[2].isActive })}
          />

          {/* Slot 4: top-right */}
          <SlotCard
            slot={config.slots[3]} index={3} label={SLOT_LABELS[3]}
            aspectClass="aspect-square"
            gridClass=""
            onEdit={() => setEditingIdx(3)}
            onToggle={() => updateSlot(3, { isActive: !config.slots[3].isActive })}
          />

          {/* Slot 2: bottom-left */}
          <SlotCard
            slot={config.slots[1]} index={1} label={SLOT_LABELS[1]}
            aspectClass="aspect-square"
            gridClass=""
            onEdit={() => setEditingIdx(1)}
            onToggle={() => updateSlot(1, { isActive: !config.slots[1].isActive })}
          />

          {/* Slot 5: bottom-right */}
          <SlotCard
            slot={config.slots[4]} index={4} label={SLOT_LABELS[4]}
            aspectClass="aspect-square"
            gridClass=""
            onEdit={() => setEditingIdx(4)}
            onToggle={() => updateSlot(4, { isActive: !config.slots[4].isActive })}
          />
        </div>
      </div>

      {/* ── Modal for editing a slot ──────────────────── */}
      {editingIdx !== null && (
        <SlotEditModal
          slot={config.slots[editingIdx]}
          label={SLOT_LABELS[editingIdx]}
          onClose={() => setEditingIdx(null)}
          onSave={(updatedSlot) => {
            updateSlot(editingIdx, updatedSlot);
            setEditingIdx(null);
          }}
        />
      )}

      {/* ── Sticky save bar ───────────────────────────── */}
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
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  SLOT CARD (Visual layout preview)
// ══════════════════════════════════════════════════════════
interface SlotCardProps {
  slot:        GallerySlot;
  index:       number;
  label:       string;
  aspectClass: string;
  gridClass:   string;
  onEdit:      () => void;
  onToggle:    () => void;
}

function SlotCard({ slot, index, label, aspectClass, gridClass, onEdit, onToggle }: SlotCardProps) {
  return (
    <div
      className={cn(
        "relative group bg-[#fafaf9] border border-[#e5e7eb] overflow-hidden",
        aspectClass,
        gridClass,
        !slot.isActive && "opacity-50"
      )}
    >
      {/* Image or placeholder */}
      {slot.image ? (
        <Image
          src={slot.image}
          alt={`Slot ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 25vw"
          unoptimized={slot.image.startsWith("/uploads")}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-[#6b7280]">
          <ImageIcon size={28} className="opacity-30 mb-1" />
          <span className="text-[10px] font-medium">Empty</span>
        </div>
      )}

      {/* Slot number badge */}
      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
        #{index + 1} {label}
      </div>

      {/* Link indicator */}
      {slot.image && slot.link && (
        <div className="absolute top-2 right-2 bg-[#c9a96e] text-white p-1" title={`Links to: ${slot.link}`}>
          <LinkIcon size={10} />
        </div>
      )}

      {/* Inactive overlay */}
      {!slot.isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="bg-white/90 text-[#1a1a1a] text-[10px] font-bold uppercase tracking-wider px-2 py-1">
            Hidden
          </span>
        </div>
      )}

      {/* Hover overlay with actions */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button
          onClick={onEdit}
          className="bg-white text-[#1a1a1a] px-3 py-2 text-xs font-semibold hover:bg-[#c9a96e] hover:text-white transition-colors flex items-center gap-1.5"
        >
          <Edit size={12} />Edit
        </button>
        <button
          onClick={onToggle}
          className={cn(
            "px-3 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5",
            slot.isActive
              ? "bg-white text-[#6b7280] hover:bg-[#6b7280] hover:text-white"
              : "bg-[#c9a96e] text-white hover:bg-[#b8955a]"
          )}
        >
          {slot.isActive
            ? <><EyeOff size={12} />Hide</>
            : <><Eye size={12} />Show</>
          }
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  EDIT MODAL
// ══════════════════════════════════════════════════════════
interface ModalProps {
  slot:    GallerySlot;
  label:   string;
  onClose: () => void;
  onSave:  (slot: Partial<GallerySlot>) => void;
}

function SlotEditModal({ slot, label, onClose, onSave }: ModalProps) {
  const [image,    setImage]    = useState(slot.image);
  const [link,     setLink]     = useState(slot.link);
  const [isActive, setIsActive] = useState(slot.isActive);
  const [tab,      setTab]      = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const [urlInput,  setUrlInput]  = useState("");
  const fileRef  = useRef<HTMLInputElement>(null);
  const toast    = useToastStore();

  // ESC to close, body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = orig;
    };
  }, [onClose]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      setImage(url);
      toast.success("Image uploaded");
    } else {
      toast.error("Upload failed");
    }
    setUploading(false);
  };

  const handleUrlAdd = async () => {
    const url = urlInput.trim();
    if (!url.startsWith("http")) return;
    setUploading(true);
    const optimized = await uploadImageFromUrl(url);
    if (optimized) {
      setImage(optimized);
      setUrlInput("");
      toast.success("Image loaded");
    } else {
      toast.error("Could not load image");
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = () => {
    onSave({ image, link, isActive });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white shadow-2xl pointer-events-auto animate-in zoom-in-95 fade-in duration-200 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] text-white flex-shrink-0">
            <h3 className="text-base font-bold">Edit Gallery Slot: {label}</h3>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* Image */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
                Image
              </label>

              {/* Tabs */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setTab("upload")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-colors",
                    tab === "upload"
                      ? "bg-[#fafaf9] border-[#1a1a1a] text-[#1a1a1a]"
                      : "border-[#e5e7eb] text-[#6b7280] hover:border-[#1a1a1a]"
                  )}
                >
                  <Upload size={12} />Upload
                </button>
                <button
                  onClick={() => setTab("url")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-colors",
                    tab === "url"
                      ? "bg-[#fafaf9] border-[#1a1a1a] text-[#1a1a1a]"
                      : "border-[#e5e7eb] text-[#6b7280] hover:border-[#1a1a1a]"
                  )}
                >
                  <LinkIcon size={12} />URL
                </button>
              </div>

              {/* Preview */}
              {image && (
                <div className="relative mb-3 border border-[#e5e7eb] overflow-hidden aspect-square bg-[#111]">
                  <Image
                    src={image}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="400px"
                    unoptimized={image.startsWith("/uploads")}
                  />
                  <button
                    onClick={() => setImage("")}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-red-500 hover:text-white text-[#1a1a1a] p-1.5 transition-colors"
                    title="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Upload zone */}
              {tab === "upload" && !image && (
                <div
                  className={cn(
                    "border-2 border-dashed aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors",
                    dragOver
                      ? "border-[#c9a96e] bg-[#f5f0e8]/50"
                      : "border-[#e5e7eb] hover:border-[#c9a96e] bg-[#fafaf9]"
                  )}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader size={24} className="text-[#c9a96e] animate-spin" />
                      <span className="text-xs text-[#6b7280]">Uploading &amp; optimizing...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-[#f5f0e8] flex items-center justify-center">
                        <ImageIcon size={18} className="text-[#c9a96e]" />
                      </div>
                      <span className="text-sm font-semibold text-[#1a1a1a]">
                        Click or drag image here
                      </span>
                      <span className="text-[10px] text-[#6b7280]">
                        JPG, PNG, WebP, AVIF &middot; Max 10 MB
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* URL input */}
              {tab === "url" && !image && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none"
                    />
                    <button
                      onClick={handleUrlAdd}
                      disabled={!urlInput.trim() || uploading}
                      className="px-4 py-2 text-xs font-semibold bg-[#1a1a1a] text-white hover:bg-[#c9a96e] transition-colors disabled:opacity-40"
                    >
                      {uploading ? <Loader size={12} className="animate-spin" /> : "Load"}
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = "";
                }}
              />
            </div>

            {/* Link */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
                Link URL (Optional)
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/collections/premium  or  https://example.com"
                className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-[#6b7280]">
                Where to send visitors when they click this image. Leave empty for no link.
              </p>
            </div>

            {/* Active toggle */}
            <label className={cn(
              "flex items-center gap-3 p-3 border cursor-pointer transition-colors",
              isActive
                ? "bg-[#f5f0e8]/40 border-[#c9a96e]"
                : "bg-[#fafaf9] border-[#e5e7eb]"
            )}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-[#c9a96e]"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1a1a1a] flex items-center gap-1.5">
                  {isActive
                    ? <><Eye size={13} className="text-[#c9a96e]" />Visible on website</>
                    : <><EyeOff size={13} className="text-[#6b7280]" />Hidden from website</>
                  }
                </p>
              </div>
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#fafaf9] border-t border-[#e5e7eb] flex-shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] hover:text-[#1a1a1a] border border-[#e5e7eb] hover:border-[#1a1a1a] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 bg-[#c9a96e] hover:bg-[#b8955a] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <Save size={12} />Apply Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}