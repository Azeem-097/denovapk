"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Image as ImageIcon, Trash2, Eye, EyeOff, GripVertical,
  Save, Loader, X, Info, Link as LinkIcon, Upload,
  LayoutGrid, Plus, Square, RectangleVertical, RectangleHorizontal, StretchHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/store/toastStore";
import type { GalleryLayout, GalleryItem, GalleryConfig } from "./page";

// ─── Layout definitions ──────────────────────────────────
const LAYOUT_OPTIONS: Array<{
  value: GalleryLayout;
  label: string;
  icon:  React.ComponentType<{ size?: number; className?: string }>;
  desc:  string;
}> = [
  { value: "square",    label: "Square",    icon: Square,               desc: "1x1 (1 col x 1 row)" },
  { value: "portrait",  label: "Portrait",  icon: RectangleVertical,    desc: "1x2 tall (1 col x 2 rows)" },
  { value: "landscape", label: "Landscape", icon: RectangleHorizontal,  desc: "2x1 wide (2 cols x 1 row)" },
  { value: "wide",      label: "Wide Banner", icon: StretchHorizontal,  desc: "3x1 full-width (3 cols x 1 row)" },
];

// ─── Upload helpers ──────────────────────────────────────
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

function genId(): string {
  return "g" + Math.random().toString(36).slice(2, 10);
}

interface Props {
  initialConfig: GalleryConfig;
}

// ══════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════
export function GalleryClient({ initialConfig }: Props) {
  const [config,      setConfig]      = useState<GalleryConfig>(initialConfig);
  const [saving,      setSaving]      = useState(false);
  const [dirty,       setDirty]       = useState(false);
  const [editingId,   setEditingId]   = useState<string | null>(null);

  const toast = useToastStore();
  const dragIndex = useRef<number | null>(null);

  // Ensure items are sorted by sortOrder
  useEffect(() => {
    const sorted = [...initialConfig.items].sort((a, b) => a.sortOrder - b.sortOrder);
    setConfig({ ...initialConfig, items: sorted });
  }, [initialConfig]);

  // ── Update helpers ────────────────────────────────────
  const updateConfig = <K extends keyof GalleryConfig>(key: K, value: GalleryConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const updateItem = (id: string, changes: Partial<GalleryItem>) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((it) => it.id === id ? { ...it, ...changes } : it),
    }));
    setDirty(true);
  };

  const addItem = () => {
    const newItem: GalleryItem = {
      id:        genId(),
      image:     "",
      name:      "",
      link:      "",
      layout:    "square",
      isActive:  true,
      sortOrder: config.items.length,
    };
    setConfig((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setDirty(true);
    // Open editor immediately for the new item
    setEditingId(newItem.id);
  };

  const removeItem = (id: string) => {
    if (!confirm("Remove this gallery image? This cannot be undone once you save.")) return;
    setConfig((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id).map((it, i) => ({ ...it, sortOrder: i })),
    }));
    setDirty(true);
  };

  // ── Drag-and-drop reorder ─────────────────────────────
  const onDragStart = (i: number) => { dragIndex.current = i; };

  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === i) return;

    const next = [...config.items];
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);

    setConfig((prev) => ({
      ...prev,
      items: next.map((it, idx) => ({ ...it, sortOrder: idx })),
    }));
    dragIndex.current = i;
    setDirty(true);
  };

  const onDragEnd = () => { dragIndex.current = null; };

  // ── Save ──────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const ordered = { ...config, items: config.items.map((it, i) => ({ ...it, sortOrder: i })) };
      const res = await fetch("/api/gallery", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ config: ordered }),
      });
      if (res.ok) {
        setConfig(ordered);
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

  const editingItem = config.items.find((it) => it.id === editingId) ?? null;

  return (
    <div className="max-w-6xl space-y-5">

      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <LayoutGrid size={22} className="text-[#E10600]" />
            Gallery Section
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Manage the &quot;Style in Action&quot; gallery on your homepage. Add unlimited images with any layout.
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

        <label className={cn(
          "flex items-center gap-3 p-3 border cursor-pointer transition-colors",
          config.enabled ? "bg-[#f5f0e8]/40 border-[#E10600]" : "bg-[#fafaf9] border-[#e5e7eb]"
        )}>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => updateConfig("enabled", e.target.checked)}
            className="w-4 h-4 accent-[#E10600]"
          />
          <p className="text-sm font-semibold text-[#1a1a1a] flex items-center gap-1.5">
            {config.enabled
              ? <><Eye size={13} className="text-[#E10600]" />Section visible on homepage</>
              : <><EyeOff size={13} className="text-[#6b7280]" />Section hidden from homepage</>
            }
          </p>
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
              className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none"
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
              className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none"
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
            className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none resize-y"
          />
        </div>
      </div>

      {/* ── Info banner ───────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
        <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <p className="font-semibold mb-1">How it works</p>
          <p>
            Add as many images as you want. Each image can have its own layout: <strong>Square</strong>,
            <strong> Portrait</strong> (tall), <strong>Landscape</strong> (wide), or <strong>Wide Banner</strong> (full row).
            <strong> Drag the ⋮⋮ handle</strong> to reorder. The frontend automatically arranges them in a CSS grid based on the sequence and layout you set.
          </p>
        </div>
      </div>

      {/* ── Gallery Items ─────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1a1a1a]">
            Gallery Images ({config.items.length})
          </h2>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E10600] hover:text-[#B80000]"
          >
            <Plus size={14} />Add Image
          </button>
        </div>

        {config.items.length === 0 ? (
          <div className="bg-white border border-dashed border-[#e5e7eb] p-12 text-center">
            <LayoutGrid size={32} className="text-[#e5e7eb] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#1a1a1a] mb-1">No gallery images yet</p>
            <p className="text-xs text-[#6b7280] mb-4">Add your first image to build the gallery.</p>
            <Button variant="primary" onClick={addItem}>
              <Plus size={14} />Add First Image
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {config.items.map((item, i) => (
              <ItemCard
                key={item.id}
                item={item}
                index={i}
                onEdit={() => setEditingId(item.id)}
                onToggleActive={() => updateItem(item.id, { isActive: !item.isActive })}
                onRemove={() => removeItem(item.id)}
                onDragStart={() => onDragStart(i)}
                onDragOver={(e) => onDragOver(e, i)}
                onDragEnd={onDragEnd}
                onLayoutChange={(layout) => updateItem(item.id, { layout })}
              />
            ))}
          </div>
        )}

        {config.items.length > 0 && (
          <button
            onClick={addItem}
            className="w-full py-3 border-2 border-dashed border-[#e5e7eb] hover:border-[#E10600] text-sm font-medium text-[#6b7280] hover:text-[#E10600] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />Add Another Image
          </button>
        )}
      </div>

      {/* ── Edit Modal ────────────────────────────────── */}
      {editingItem && (
        <ItemEditModal
          item={editingItem}
          onClose={() => setEditingId(null)}
          onSave={(changes) => {
            updateItem(editingItem.id, changes);
            setEditingId(null);
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
//  ITEM CARD
// ══════════════════════════════════════════════════════════
interface ItemCardProps {
  item:          GalleryItem;
  index:         number;
  onEdit:        () => void;
  onToggleActive: () => void;
  onRemove:      () => void;
  onDragStart:   () => void;
  onDragOver:    (e: React.DragEvent) => void;
  onDragEnd:     () => void;
  onLayoutChange: (layout: GalleryLayout) => void;
}

function ItemCard({
  item, index, onEdit, onToggleActive, onRemove,
  onDragStart, onDragOver, onDragEnd, onLayoutChange,
}: ItemCardProps) {
  const safeLayout: GalleryLayout = (item.layout && ["square","portrait","landscape","wide"].includes(item.layout))
    ? item.layout
    : "square";
  const LayoutIcon = LAYOUT_OPTIONS.find((l) => l.value === safeLayout)?.icon ?? Square;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={cn(
        "bg-white border border-[#e5e7eb] overflow-hidden transition-all",
        !item.isActive && "opacity-60"
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] bg-[#fafaf9]">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name || `Gallery item ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={item.image.startsWith("/uploads")}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#6b7280]">
            <ImageIcon size={32} className="opacity-30 mb-2" />
            <span className="text-[10px] font-medium">Click Edit to add image</span>
          </div>
        )}

        {/* Sort number + drag handle */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <div className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
            #{index + 1}
          </div>
          <div className="bg-black/70 backdrop-blur-sm text-white p-1 cursor-grab active:cursor-grabbing" title="Drag to reorder">
            <GripVertical size={12} />
          </div>
        </div>

        {/* Layout badge */}
        <div className="absolute top-2 right-2 bg-[#E10600] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider flex items-center gap-1">
          <LayoutIcon size={11} />
          {safeLayout}
        </div>

        {/* Hidden overlay */}
        {!item.isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="bg-white/90 text-[#1a1a1a] text-[10px] font-bold uppercase tracking-wider px-2 py-1">
              Hidden
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {item.name && (
          <p className="text-xs font-semibold text-[#1a1a1a] line-clamp-1">{item.name}</p>
        )}
        {item.link && (
          <p className="text-[10px] text-[#6b7280] flex items-center gap-1 line-clamp-1">
            <LinkIcon size={9} />
            {item.link}
          </p>
        )}

        {/* Layout picker */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1">
            Layout
          </label>
          <div className="grid grid-cols-4 gap-1">
            {LAYOUT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = safeLayout === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onLayoutChange(opt.value)}
                  title={`${opt.label} — ${opt.desc}`}
                  className={cn(
                    "flex items-center justify-center p-2 border transition-colors",
                    isActive
                      ? "border-[#E10600] bg-[#E10600] text-white"
                      : "border-[#e5e7eb] text-[#6b7280] hover:border-[#E10600]"
                  )}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 pt-1 border-t border-[#e5e7eb]">
          <button
            onClick={onEdit}
            className="flex-1 py-2 text-[11px] font-semibold text-[#1a1a1a] hover:bg-[#fafaf9] transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onToggleActive}
            className={cn(
              "p-2 transition-colors",
              item.isActive ? "text-[#E10600] hover:text-[#B80000]" : "text-[#6b7280] hover:text-[#1a1a1a]"
            )}
            title={item.isActive ? "Hide from site" : "Show on site"}
          >
            {item.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={onRemove}
            className="p-2 text-[#6b7280] hover:text-red-500 transition-colors"
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  EDIT MODAL
// ══════════════════════════════════════════════════════════
interface ModalProps {
  item:    GalleryItem;
  onClose: () => void;
  onSave:  (changes: Partial<GalleryItem>) => void;
}

function ItemEditModal({ item, onClose, onSave }: ModalProps) {
  const [image,    setImage]    = useState(item.image);
  const [name,     setName]     = useState(item.name);
  const [link,     setLink]     = useState(item.link);
  const [layout,   setLayout]   = useState<GalleryLayout>(item.layout);
  const [isActive, setIsActive] = useState(item.isActive);
  const [tab,      setTab]      = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const [urlInput,  setUrlInput]  = useState("");
  const fileRef  = useRef<HTMLInputElement>(null);
  const toast    = useToastStore();

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
    onSave({ image, name, link, layout, isActive });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white shadow-2xl pointer-events-auto overflow-hidden">

          <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] text-white flex-shrink-0">
            <h3 className="text-base font-bold">Edit Gallery Image</h3>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* Image */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
                Image
              </label>

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

              {tab === "upload" && !image && (
                <div
                  className={cn(
                    "border-2 border-dashed aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors",
                    dragOver
                      ? "border-[#E10600] bg-[#f5f0e8]/50"
                      : "border-[#e5e7eb] hover:border-[#E10600] bg-[#fafaf9]"
                  )}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader size={24} className="text-[#E10600] animate-spin" />
                      <span className="text-xs text-[#6b7280]">Uploading &amp; optimizing...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-[#f5f0e8] flex items-center justify-center">
                        <ImageIcon size={18} className="text-[#E10600]" />
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

              {tab === "url" && !image && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none"
                  />
                  <button
                    onClick={handleUrlAdd}
                    disabled={!urlInput.trim() || uploading}
                    className="px-4 py-2 text-xs font-semibold bg-[#1a1a1a] text-white hover:bg-[#E10600] transition-colors disabled:opacity-40"
                  >
                    {uploading ? <Loader size={12} className="animate-spin" /> : "Load"}
                  </button>
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

            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
                Image Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Summer vibes at DHA"
                className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-[#6b7280]">
                Internal label to help you identify this image. Not shown to visitors.
              </p>
            </div>

            {/* Layout */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
                Display Layout
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LAYOUT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = layout === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setLayout(opt.value)}
                      className={cn(
                        "flex items-center gap-2 p-3 border transition-colors text-left",
                        isActive
                          ? "border-[#E10600] bg-[#E10600] text-white"
                          : "border-[#e5e7eb] hover:border-[#E10600]"
                      )}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold">{opt.label}</p>
                        <p className={cn("text-[9px] mt-0.5", isActive ? "text-white/80" : "text-[#6b7280]")}>
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
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
                className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-[#6b7280]">
                Where to send visitors when they click this image.
              </p>
            </div>

            {/* Active toggle */}
            <label className={cn(
              "flex items-center gap-3 p-3 border cursor-pointer transition-colors",
              isActive
                ? "bg-[#f5f0e8]/40 border-[#E10600]"
                : "bg-[#fafaf9] border-[#e5e7eb]"
            )}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-[#E10600]"
              />
              <p className="text-sm font-semibold text-[#1a1a1a] flex items-center gap-1.5">
                {isActive
                  ? <><Eye size={13} className="text-[#E10600]" />Visible on website</>
                  : <><EyeOff size={13} className="text-[#6b7280]" />Hidden from website</>
                }
              </p>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#fafaf9] border-t border-[#e5e7eb] flex-shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] hover:text-[#1a1a1a] border border-[#e5e7eb] hover:border-[#1a1a1a] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 bg-[#E10600] hover:bg-[#B80000] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <Save size={12} />Apply Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}