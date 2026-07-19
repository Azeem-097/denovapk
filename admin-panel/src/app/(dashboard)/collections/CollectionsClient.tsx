"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus, Edit, MoreVertical, Trash2, Eye, EyeOff,
  Search, X, Save, Loader, FolderOpen, ExternalLink,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge }  from "@/components/ui/Badge";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { formatDate, cn, slugify } from "@/lib/utils";
import { useToastStore }  from "@/store/toastStore";
import { confirmAction }  from "@/store/confirmStore";
import type { AdminCollection } from "@/types";

interface Props {
  initialCollections: AdminCollection[];
}

interface CollectionFormData {
  name:            string;
  slug:            string;
  description:     string;
  image:           string;
  isActive:        boolean;
  metaTitle:       string;
  metaDescription: string;
}

// ══════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════
export function CollectionsClient({ initialCollections }: Props) {
  const toast = useToastStore();
  const [collections, setCollections] = useState<AdminCollection[]>(initialCollections);
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState<"all" | "active" | "inactive">("all");
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editing,     setEditing]     = useState<AdminCollection | null>(null);
  const [menuOpen,    setMenuOpen]    = useState<string | null>(null);

  // ── Filtered list ─────────────────────────────────────
  const filtered = useMemo(() => {
    return collections.filter((c) => {
      const matchFilter =
        filter === "all" ||
        (filter === "active" && c.isActive) ||
        (filter === "inactive" && !c.isActive);
      const matchSearch =
        search.trim() === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [collections, search, filter]);

  const counts = useMemo(() => ({
    all:      collections.length,
    active:   collections.filter((c) => c.isActive).length,
    inactive: collections.filter((c) => !c.isActive).length,
  }), [collections]);

  // ── Refresh from server ───────────────────────────────
  const refresh = async () => {
    try {
      const r = await fetch("/api/collections");
      const d = await r.json();
      if (d.collections) {
        // Map DB shape to AdminCollection
        const adapted: AdminCollection[] = d.collections.map((c: {
          id: string; name: string; slug: string; description: string;
          image: string | null; isActive: number; productCount: number; createdAt: number;
        }) => ({
          id:           c.id,
          name:         c.name,
          slug:         c.slug,
          description:  c.description,
          image:        c.image ?? "",
          isActive:     c.isActive === 1,
          productCount: Number(c.productCount),
          createdAt:    new Date(Number(c.createdAt) * 1000).toISOString(),
        }));
        setCollections(adapted);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    }
  };

  // ── Save (create or update) ───────────────────────────
  const handleSave = async (form: CollectionFormData) => {
    const url    = editing ? `/api/collections/${editing.id}` : "/api/collections";
    const method = editing ? "PATCH" : "POST";

    const res  = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Save failed", editing ? "Update Failed" : "Create Failed");
      return false;
    }

    setModalOpen(false);
    setEditing(null);
    await refresh();
    toast.success(
      editing
        ? `"${form.name}" updated successfully`
        : `"${form.name}" created successfully`,
      "Saved"
    );
    return true;
  };

  // ── Delete ────────────────────────────────────────────
  const handleDelete = async (c: AdminCollection) => {
    const ok = await confirmAction({
      title:       "Delete Collection",
      message:     c.productCount > 0
        ? `Delete "${c.name}"? ${c.productCount} product${c.productCount === 1 ? "" : "s"} assigned to it will be unlinked (but NOT deleted). This action cannot be undone.`
        : `Delete "${c.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      variant:     "danger",
    });
    if (!ok) return;

    setMenuOpen(null);

    const res  = await fetch(`/api/collections/${c.id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Delete failed", "Delete Failed");
      return;
    }

    setCollections((prev) => prev.filter((x) => x.id !== c.id));
    toast.success(
      data.unlinkedProducts > 0
        ? `"${c.name}" deleted. ${data.unlinkedProducts} product${data.unlinkedProducts === 1 ? "" : "s"} unlinked.`
        : `"${c.name}" deleted.`,
      "Deleted"
    );
  };

  // ── Toggle active ─────────────────────────────────────
  const handleToggleActive = async (c: AdminCollection) => {
    setMenuOpen(null);
    const newState = !c.isActive;

    const res = await fetch(`/api/collections/${c.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isActive: newState }),
    });

    if (!res.ok) {
      toast.error("Failed to toggle status");
      return;
    }

    setCollections((prev) => prev.map((x) =>
      x.id === c.id ? { ...x, isActive: newState } : x
    ));
    toast.success(
      `"${c.name}" is now ${newState ? "active" : "inactive"}.`,
      newState ? "Enabled" : "Disabled"
    );
  };

  // ══════════════════════════════════════════════════════
  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <FolderOpen size={22} className="text-[#3b5f8f]" />
            Collections
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Organize your products into collections.
          </p>
        </div>
        <Button variant="primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus size={14} />Add Collection
        </Button>
      </div>

      {/* ── Filter tabs ─────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-[#e5e7eb]">
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors capitalize border-b-2 -mb-px",
              filter === f
                ? "border-[#3b5f8f] text-[#3b5f8f]"
                : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]"
            )}
          >
            {f}
            <span className={cn(
              "ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full",
              filter === f ? "bg-[#3b5f8f]/20 text-[#3b5f8f]" : "bg-[#e5e7eb] text-[#6b7280]"
            )}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search bar ──────────────────────────────── */}
      <div className="bg-white border border-[#e5e7eb] p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collections by name or slug..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none placeholder:text-[#6b7280]/60"
          />
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="bg-white border border-dashed border-[#e5e7eb] p-16 text-center">
          <FolderOpen size={40} className="text-[#e5e7eb] mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#1a1a1a] mb-1">
            {search.trim() !== "" || filter !== "all"
              ? "No matching collections"
              : "No collections yet"}
          </p>
          <p className="text-xs text-[#6b7280] mb-5">
            {search.trim() !== "" || filter !== "all"
              ? "Try changing your search or filter."
              : "Create your first collection to organize products."}
          </p>
          {search.trim() === "" && filter === "all" && (
            <Button variant="primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
              <Plus size={14} />Create First Collection
            </Button>
          )}
        </div>
      )}

      {/* ── Grid ────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <CollectionCard
              key={c.id}
              collection={c}
              menuOpen={menuOpen === c.id}
              onOpenMenu={() => setMenuOpen(menuOpen === c.id ? null : c.id)}
              onCloseMenu={() => setMenuOpen(null)}
              onEdit={() => { setEditing(c); setModalOpen(true); setMenuOpen(null); }}
              onToggle={() => handleToggleActive(c)}
              onDelete={() => handleDelete(c)}
            />
          ))}
        </div>
      )}

      {/* ── Modal ───────────────────────────────────── */}
      {modalOpen && (
        <CollectionModal
          collection={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  COLLECTION CARD
// ══════════════════════════════════════════════════════════
interface CardProps {
  collection:   AdminCollection;
  menuOpen:     boolean;
  onOpenMenu:   () => void;
  onCloseMenu:  () => void;
  onEdit:       () => void;
  onToggle:     () => void;
  onDelete:     () => void;
}

function CollectionCard({
  collection: c, menuOpen, onOpenMenu, onCloseMenu,
  onEdit, onToggle, onDelete,
}: CardProps) {
  return (
    <div className={cn(
      "bg-white border overflow-hidden group transition-colors",
      c.isActive ? "border-[#e5e7eb] hover:border-[#3b5f8f]" : "border-[#e5e7eb] opacity-70"
    )}>
      {/* Image */}
      <div className="relative aspect-[16/10] bg-[#fafaf9]">
        {c.image ? (
          <Image
            src={c.image}
            alt={c.name}
            fill
            className="object-cover"
            sizes="400px"
            unoptimized={c.image.startsWith("/uploads")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={32} className="text-[#e5e7eb]" />
          </div>
        )}

        {/* Three-dot menu */}
        <div className="absolute top-2 right-2">
          <button
            onClick={onOpenMenu}
            className="w-8 h-8 bg-white/90 hover:bg-white flex items-center justify-center text-[#1a1a1a] shadow-sm"
          >
            <MoreVertical size={14} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={onCloseMenu} />
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#e5e7eb] shadow-lg z-20 py-1">
                <button
                  onClick={onEdit}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-[#1a1a1a] hover:bg-[#fafaf9]"
                >
                  <Edit size={12} />Edit Collection
                </button>
                <button
                  onClick={onToggle}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-[#1a1a1a] hover:bg-[#fafaf9]"
                >
                  {c.isActive ? <><EyeOff size={12} />Deactivate</> : <><Eye size={12} />Activate</>}
                </button>
                <div className="border-t border-[#e5e7eb] my-1" />
                <button
                  onClick={onDelete}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={12} />Delete
                </button>
              </div>
            </>
          )}
        </div>

        {/* Inactive badge */}
        {!c.isActive && (
          <Badge variant="default" className="absolute top-2 left-2">
            Inactive
          </Badge>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-[#1a1a1a] truncate flex-1">{c.name}</h3>
          <code className="text-[10px] text-[#6b7280] font-mono flex-shrink-0">/{c.slug}</code>
        </div>
        <p className="text-xs text-[#6b7280] line-clamp-2 mb-3 min-h-[2.5em]">
          {c.description || <span className="italic">No description</span>}
        </p>
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-[#3b5f8f] font-semibold">
            {c.productCount} product{c.productCount === 1 ? "" : "s"}
          </span>
          <span className="text-[#6b7280]">Created {formatDate(c.createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onEdit}
            className="py-2 text-xs font-semibold border border-[#e5e7eb] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <Edit size={11} />Edit
          </button>
          <Link
            href={`/products?collection=${encodeURIComponent(c.name)}`}
            className="py-2 text-xs font-semibold border border-[#3b5f8f] text-[#3b5f8f] hover:bg-[#3b5f8f] hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <ExternalLink size={11} />Manage
          </Link>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  COLLECTION MODAL (Add / Edit)
// ══════════════════════════════════════════════════════════
interface ModalProps {
  collection: AdminCollection | null;
  onClose:    () => void;
  onSave:     (form: CollectionFormData) => Promise<boolean>;
}

function CollectionModal({ collection, onClose, onSave }: ModalProps) {
  const toast = useToastStore();
  const isEditing = !!collection;

  const [form, setForm] = useState<CollectionFormData>({
    name:            collection?.name        ?? "",
    slug:            collection?.slug        ?? "",
    description:     collection?.description ?? "",
    image:           collection?.image       ?? "",
    isActive:        collection?.isActive    ?? true,
    metaTitle:       "",
    metaDescription: "",
  });
  const [saving,     setSaving]     = useState(false);
  const [slugEdited, setSlugEdited] = useState(isEditing);

  // Auto-generate slug from name (unless user manually edited)
  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugEdited ? prev.slug : slugify(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Collection name is required");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return;
    }
    setSaving(true);
    const success = await onSave(form);
    if (!success) setSaving(false);
  };

  // Lock body scroll
  useState(() => {
    if (typeof document !== "undefined") {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = orig; };
    }
  });

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white shadow-2xl pointer-events-auto animate-in zoom-in-95 fade-in duration-200 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb] flex-shrink-0">
            <h2 className="text-lg font-bold text-[#1a1a1a] flex items-center gap-2">
              <FolderOpen size={18} className="text-[#3b5f8f]" />
              {isEditing ? "Edit Collection" : "Create Collection"}
            </h2>
            <button onClick={onClose} className="p-1 text-[#6b7280] hover:text-[#1a1a1a]">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-5">

              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Summer Essentials"
                  required
                  className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
                  URL Slug *
                </label>
                <div className="flex items-center border border-[#e5e7eb] focus-within:border-[#3b5f8f]">
                  <span className="pl-3 pr-1 text-xs text-[#6b7280] font-mono select-none">
                    /collections/
                  </span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => { setForm({ ...form, slug: slugify(e.target.value) }); setSlugEdited(true); }}
                    placeholder="summer-essentials"
                    required
                    className="flex-1 py-2.5 pr-3 text-sm bg-transparent focus:outline-none font-mono"
                  />
                </div>
                <p className="mt-1 text-[10px] text-[#6b7280]">
                  Lowercase letters, numbers, and hyphens only. Used in the URL.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description shown on the collection page..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none resize-y"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
                  Collection Image
                </label>
                <ImageUploader
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url })}
                  type="product"
                  aspectRatio="aspect-[16/10]"
                />
              </div>

              {/* SEO (optional, collapsed by default) */}
              <details className="border border-[#e5e7eb] p-3">
                <summary className="text-xs font-bold uppercase tracking-wide text-[#1a1a1a] cursor-pointer">
                  SEO (optional)
                </summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#6b7280] mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={form.metaTitle}
                      onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                      placeholder="Shown in browser tab / search results"
                      className="w-full px-3 py-2 text-xs border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6b7280] mb-1">
                      Meta Description
                    </label>
                    <textarea
                      value={form.metaDescription}
                      onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                      placeholder="Description for search engines"
                      rows={2}
                      className="w-full px-3 py-2 text-xs border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none resize-y"
                    />
                  </div>
                </div>
              </details>

              {/* Active toggle */}
              <label className={cn(
                "flex items-center gap-3 p-3 border cursor-pointer transition-colors",
                form.isActive
                  ? "bg-[#f5f0e8]/40 border-[#3b5f8f]"
                  : "bg-[#fafaf9] border-[#e5e7eb]"
              )}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#3b5f8f]"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1a1a1a] flex items-center gap-1.5">
                    {form.isActive
                      ? <><Eye size={13} className="text-[#3b5f8f]" />Active (visible on website)</>
                      : <><EyeOff size={13} className="text-[#6b7280]" />Inactive (hidden from customers)</>
                    }
                  </p>
                </div>
              </label>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#fafaf9] border-t border-[#e5e7eb] flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] hover:text-[#1a1a1a] border border-[#e5e7eb] hover:border-[#1a1a1a] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !form.name.trim()}
                className="inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#3b5f8f] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving
                  ? <><Loader size={12} className="animate-spin" />Saving...</>
                  : <><Save size={12} />{isEditing ? "Update Collection" : "Create Collection"}</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}