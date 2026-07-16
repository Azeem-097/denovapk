"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Image as ImageIcon, Plus, GripVertical, Trash2,
  Eye, EyeOff, Edit, X, Loader, ExternalLink, Link as LinkIcon,
  Upload, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore }   from "@/store/toastStore";
import { useConfirmStore } from "@/store/confirmStore";

// ─── Types ───────────────────────────────────────────────
export interface HeroBanner {
  id:                   string;
  image:                string;
  title:                string;   // acts as alt text + card title
  subtitle:             string;
  description:          string;
  buttonLabel:          string;
  buttonHref:           string;   // main link — "Link URL" in UI
  buttonSecondaryLabel: string;
  buttonSecondaryHref:  string;
  isActive:             boolean;
  sortOrder:            number;
}

function genId(): string {
  return "b" + Math.random().toString(36).slice(2, 14);
}

function emptyBanner(): HeroBanner {
  return {
    id:                   genId(),
    image:                "",
    title:                "",
    subtitle:             "",
    description:          "",
    buttonLabel:          "",
    buttonHref:           "",
    buttonSecondaryLabel: "",
    buttonSecondaryHref:  "",
    isActive:             true,
    sortOrder:            0,
  };
}

// ─── Image upload helper ─────────────────────────────────
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

// ─── Auto-save helper ────────────────────────────────────
async function saveBanners(banners: HeroBanner[]): Promise<boolean> {
  try {
    const ordered = banners.map((b, i) => ({ ...b, sortOrder: i }));
    const res  = await fetch("/api/hero-banners", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ banners: ordered }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Props ───────────────────────────────────────────────
interface Props {
  initialBanners: HeroBanner[];
}

// ══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export function HeroBannersClient({ initialBanners }: Props) {
  const [banners,     setBanners]     = useState<HeroBanner[]>(initialBanners);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [previewUrl,  setPreviewUrl]  = useState<string | null>(null);

  const toast   = useToastStore();
  const confirm = useConfirmStore();

  // ── Persist to server ──────────────────────────────────
  const persist = async (next: HeroBanner[], successMsg?: string) => {
    setBanners(next);
    const ok = await saveBanners(next);
    if (ok && successMsg) toast.success(successMsg);
    if (!ok) toast.error("Failed to save. Check your connection.");
  };

  // ── Add banner (open empty modal) ──────────────────────
  const handleAdd = () => {
    setEditingId(null);
    setModalOpen(true);
  };

  // ── Edit banner ────────────────────────────────────────
  const handleEdit = (id: string) => {
    setEditingId(id);
    setModalOpen(true);
  };

  // ── Save from modal (add or update) ────────────────────
  const handleModalSave = async (banner: HeroBanner) => {
    let next: HeroBanner[];
    let msg: string;
    if (editingId) {
      next = banners.map((b) => b.id === editingId ? banner : b);
      msg = "Banner updated";
    } else {
      next = [...banners, banner];
      msg = "Banner added";
    }
    setModalOpen(false);
    setEditingId(null);
    await persist(next, msg);
  };

  // ── Delete banner ──────────────────────────────────────
  const handleDelete = async (id: string) => {
    const ok = await confirm.confirm({
      title:       "Delete Banner",
      message:     "Are you sure you want to delete this banner? This cannot be undone.",
      confirmText: "Delete",
      variant:     "danger",
    });
    if (!ok) return;
    const next = banners.filter((b) => b.id !== id);
    await persist(next, "Banner deleted");
  };

  // ── Toggle active ──────────────────────────────────────
  const handleToggleActive = async (id: string) => {
    const banner = banners.find((b) => b.id === id);
    if (!banner) return;
    const next = banners.map((b) =>
      b.id === id ? { ...b, isActive: !b.isActive } : b
    );
    await persist(next, banner.isActive ? "Banner hidden from website" : "Banner shown on website");
  };

  // ── Drag-and-drop reorder ──────────────────────────────
  const dragIndex = useRef<number | null>(null);

  const onDragStart = (i: number) => { dragIndex.current = i; };

  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === i) return;
    const next = [...banners];
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);
    setBanners(next);
    dragIndex.current = i;
  };

  const onDragEnd = async () => {
    dragIndex.current = null;
    await persist(banners, "Order updated");
  };

  const editingBanner = editingId
    ? banners.find((b) => b.id === editingId) ?? null
    : null;

  // ══════════════════════════════════════════════════════
  return (
    <div className="space-y-5">

      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <ImageIcon size={22} className="text-[#c9a96e]" />
            Hero Banners
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Manage the homepage hero slider ({banners.length} banner{banners.length === 1 ? "" : "s"})
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-[#c9a96e] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#b8955a] transition-colors"
        >
          <Plus size={16} />Add Banner
        </button>
      </div>

      {/* ── Info banner ───────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
        <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <p className="font-semibold mb-1">How it works</p>
          <p>
            <strong>Drag &amp; drop</strong> any card to reorder banners — the first one appears first on the homepage.
            Click the thumbnail or <Eye size={11} className="inline" /> <strong>View</strong> to preview full-size.
            Toggle <EyeOff size={11} className="inline" /> to hide a banner from the site without deleting it.
            <br />
            Recommended image size: <strong>1920 &times; 800 px</strong>.
          </p>
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────── */}
      {banners.length === 0 && (
        <div className="bg-white border border-dashed border-[#e5e7eb] p-16 text-center">
          <ImageIcon size={40} className="text-[#e5e7eb] mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#1a1a1a] mb-1">No banners yet</p>
          <p className="text-xs text-[#6b7280] mb-5">Add your first hero banner to get started.</p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-[#c9a96e] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#b8955a] transition-colors"
          >
            <Plus size={16} />Add First Banner
          </button>
        </div>
      )}

      {/* ── Card Grid ─────────────────────────────────── */}
      {banners.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((banner, i) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              index={i}
              onEdit={() => handleEdit(banner.id)}
              onDelete={() => handleDelete(banner.id)}
              onToggleActive={() => handleToggleActive(banner.id)}
              onView={() => setPreviewUrl(banner.image)}
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => onDragOver(e, i)}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────── */}
      {modalOpen && (
        <BannerModal
          banner={editingBanner}
          onSave={handleModalSave}
          onClose={() => { setModalOpen(false); setEditingId(null); }}
        />
      )}

      {/* ── Full-size preview ─────────────────────────── */}
      {previewUrl && (
        <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  BANNER CARD
// ══════════════════════════════════════════════════════════
interface BannerCardProps {
  banner:         HeroBanner;
  index:          number;
  onEdit:         () => void;
  onDelete:       () => void;
  onToggleActive: () => void;
  onView:         () => void;
  onDragStart:    () => void;
  onDragOver:     (e: React.DragEvent) => void;
  onDragEnd:      () => void;
}

function BannerCard({
  banner, index,
  onEdit, onDelete, onToggleActive, onView,
  onDragStart, onDragOver, onDragEnd,
}: BannerCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={cn(
        "bg-white border border-[#e5e7eb] overflow-hidden transition-shadow hover:shadow-md cursor-move",
        !banner.isActive && "opacity-60"
      )}
    >
      {/* ── Image thumbnail ──────────────────────────── */}
      <div
        className="relative aspect-[16/9] bg-[#111] overflow-hidden group"
        onClick={onView}
      >
        {banner.image ? (
          <Image
            src={banner.image}
            alt={banner.title || "Banner"}
            fill
            className="object-cover cursor-zoom-in"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={banner.image.startsWith("/uploads")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={32} className="text-[#333]" />
          </div>
        )}

        {/* Index badge + drag handle */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1">
          <GripVertical size={12} className="opacity-60" />
          #{index + 1}
        </div>

        {/* Inactive overlay */}
        {!banner.isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="bg-white/90 text-[#1a1a1a] text-xs font-bold uppercase tracking-wider px-3 py-1">
              Hidden
            </span>
          </div>
        )}
      </div>

      {/* ── Card body ────────────────────────────────── */}
      <div className="p-4">
        <p className="text-sm font-bold text-[#1a1a1a] truncate mb-1">
          {banner.title || <span className="text-[#6b7280] font-normal italic">Untitled banner</span>}
        </p>
        <p className="text-xs text-[#6b7280] flex items-center gap-1 truncate">
          {banner.buttonHref ? (
            <>
              <LinkIcon size={11} className="flex-shrink-0" />
              <span className="truncate">{banner.buttonHref}</span>
            </>
          ) : (
            <span className="italic">No link</span>
          )}
        </p>
      </div>

      {/* ── Action bar ────────────────────────────────── */}
      <div className="grid grid-cols-3 border-t border-[#e5e7eb]">
        <button
          onClick={onView}
          disabled={!banner.image}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-[#c9a96e] hover:bg-[#f5f0e8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Eye size={13} />View
        </button>
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-[#1a1a1a] border-l border-r border-[#e5e7eb] hover:bg-[#fafaf9] transition-colors"
        >
          <Edit size={13} />Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={13} />Delete
        </button>
      </div>

      {/* ── Toggle bar ────────────────────────────────── */}
      <button
        onClick={onToggleActive}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold border-t border-[#e5e7eb] transition-colors",
          banner.isActive
            ? "text-[#c9a96e] bg-[#f5f0e8]/40 hover:bg-[#f5f0e8]"
            : "text-[#6b7280] bg-[#fafaf9] hover:bg-[#f0f0f0]"
        )}
      >
        {banner.isActive ? (
          <><EyeOff size={13} />Hide from Website</>
        ) : (
          <><Eye size={13} />Show on Website</>
        )}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  BANNER MODAL (Add / Edit)
// ══════════════════════════════════════════════════════════
interface BannerModalProps {
  banner:  HeroBanner | null;   // null = adding new
  onSave:  (banner: HeroBanner) => void;
  onClose: () => void;
}

function BannerModal({ banner, onSave, onClose }: BannerModalProps) {
  const [form, setForm] = useState<HeroBanner>(banner ?? emptyBanner());
  const [tab,  setTab]  = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [urlInput,  setUrlInput]  = useState("");
  const [saving,    setSaving]    = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const fileRef  = useRef<HTMLInputElement>(null);
  const toast    = useToastStore();

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, []);

  const update = <K extends keyof HeroBanner>(field: K, value: HeroBanner[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      update("image", url);
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
      update("image", optimized);
      setUrlInput("");
      toast.success("Image loaded from URL");
    } else {
      toast.error("Could not load image from URL");
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async () => {
    if (!form.image) {
      toast.error("Please add a banner image");
      return;
    }
    setSaving(true);
    onSave(form);
  };

  const isEditing = !!banner;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white shadow-2xl pointer-events-auto animate-in zoom-in-95 fade-in duration-200 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] text-white flex-shrink-0">
            <h3 className="text-base font-bold">
              {isEditing ? "Edit Banner" : "Add New Banner"}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* ── Banner Image ────────────────────────── */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
                Banner Image *
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

              {/* Existing image preview */}
              {form.image && (
                <div className="relative mb-3 border border-[#e5e7eb] overflow-hidden aspect-[21/9] bg-[#111]">
                  <Image
                    src={form.image}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="600px"
                    unoptimized={form.image.startsWith("/uploads")}
                  />
                  <button
                    onClick={() => update("image", "")}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-red-500 hover:text-white text-[#1a1a1a] p-1.5 transition-colors"
                    title="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Upload zone */}
              {tab === "upload" && !form.image && (
                <div
                  className={cn(
                    "border-2 border-dashed aspect-[21/9] flex flex-col items-center justify-center cursor-pointer transition-colors",
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
                      <span className="text-xs text-[#6b7280]">Uploading & optimizing...</span>
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
              {tab === "url" && !form.image && (
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
                  <p className="text-[10px] text-[#6b7280]">
                    External URLs are auto-downloaded and optimized.
                  </p>
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

              <p className="mt-2 text-[10px] text-[#6b7280] flex items-center gap-1">
                <Info size={10} />
                Recommended: 1920 &times; 800 px &middot; Auto-optimized to AVIF/WebP
              </p>
            </div>

            {/* ── Title / Alt Text ────────────────────── */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
                Banner Title / Alt Text
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Summer Collection - 30% Off"
                className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-[#6b7280]">
                Shown as the card title and used for search engines / screen readers.
              </p>
            </div>

            {/* ── Link URL ────────────────────────────── */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
                Link URL (Optional)
              </label>
              <input
                type="text"
                value={form.buttonHref}
                onChange={(e) => update("buttonHref", e.target.value)}
                placeholder="/collections/summer  or  https://example.com/promo"
                className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-[#6b7280]">
                Where to send customers when they click the banner. Leave empty for no link.
              </p>
            </div>

            {/* ── Active toggle ───────────────────────── */}
            <label className={cn(
              "flex items-center gap-3 p-3 border cursor-pointer transition-colors",
              form.isActive
                ? "bg-[#f5f0e8]/40 border-[#c9a96e]"
                : "bg-[#fafaf9] border-[#e5e7eb]"
            )}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => update("isActive", e.target.checked)}
                className="w-4 h-4 accent-[#c9a96e]"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1a1a1a] flex items-center gap-1.5">
                  {form.isActive
                    ? <><Eye size={13} className="text-[#c9a96e]" />Active (show on website)</>
                    : <><EyeOff size={13} className="text-[#6b7280]" />Hidden (draft)</>
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
              disabled={saving || !form.image}
              className="inline-flex items-center gap-2 bg-[#c9a96e] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#b8955a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <><Loader size={12} className="animate-spin" />Saving...</>
              ) : isEditing ? (
                <><Edit size={12} />Update Banner</>
              ) : (
                <><Plus size={12} />Add Banner</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════
//  IMAGE PREVIEW MODAL
// ══════════════════════════════════════════════════════════
function ImagePreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
        aria-label="Close preview"
      >
        <X size={20} />
      </button>
      <div className="relative w-full max-w-6xl aspect-[21/9]">
        <Image
          src={url}
          alt="Full-size banner preview"
          fill
          className="object-contain"
          sizes="100vw"
          unoptimized={url.startsWith("/uploads")}
        />
      </div>
    </div>
  );
}