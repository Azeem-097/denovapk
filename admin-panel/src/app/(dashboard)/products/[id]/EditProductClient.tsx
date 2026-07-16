"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ExternalLink, Trash, Copy, Save, Plus, X,
  Package, Layers, Percent, Tag, ChevronRight, Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { slugify, cn } from "@/lib/utils";
import { paisaToRupees } from "@/lib/priceUtils";
import { PRODUCT_STATUS_COLORS } from "@/lib/constants";
import { MultiImageUploader } from "@/components/ui/MultiImageUploader";
import { useToastStore } from "@/store/toastStore";
import { confirmAction } from "@/store/confirmStore";
import type { ProductWithRelations } from "@/lib/db/repositories/products";

interface Props {
  product:     ProductWithRelations;
  collections: Array<{ id: string; name: string }>;
}

interface VariantForm {
  id?:      string;   // present = existing variant
  color:    string;
  colorHex: string;
  sku:      string;
  stock:    number;
  price:    number;
}

type ModalId = null | "stock" | "collection" | "discount" | "status";

export function EditProductClient({ product, collections }: Props) {
  const router = useRouter();
  const toast  = useToastStore();

  // ─── Form state, initialized from product ──────────────
  const initialImages = useMemo(
    () => product.images
      .slice()
      .sort((a, b) => (b.isPrimary - a.isPrimary) || (a.sortOrder - b.sortOrder))
      .map((i) => i.url),
    [product.images]
  );

  const initialVariants: VariantForm[] = useMemo(
    () => product.variants.map((v) => ({
      id:       v.id,
      color:    v.color,
      colorHex: v.colorHex,
      sku:      v.sku,
      stock:    v.stock,
      price:    paisaToRupees(v.price),
    })),
    [product.variants]
  );

  const [form, setForm] = useState({
    name:         product.name,
    slug:         product.slug,
    sku:          product.sku,
    description:  product.description,
    price:        paisaToRupees(product.price).toString(),
    comparePrice: product.comparePrice ? paisaToRupees(product.comparePrice).toString() : "",
    collectionId: product.collectionId ?? "",
    status:       product.status.toLowerCase(),
    isNew:        product.isNew === 1,
    isFeatured:   product.isFeatured === 1,
    isBestSeller: product.isBestSeller === 1,
    tags:         product.tags ?? "",
    waist:        product.waist  != null ? String(product.waist)  : "",
    length:       product.length != null ? String(product.length) : "",
    bottom:       product.bottom != null ? String(product.bottom) : "",
  });

  const [images,   setImages]   = useState<string[]>(initialImages);
  const [variants, setVariants] = useState<VariantForm[]>(initialVariants);
  const [saving,   setSaving]   = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [modal,    setModal]    = useState<ModalId>(null);

  const updateField = (field: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  // ─── Variant handlers ─────────────────────────────────
  const addVariant = () => {
    setVariants([...variants, {
      color:    "New Color",
      colorHex: "#1e3a5f",
      sku:      `${form.sku || "SKU"}-NEW`,
      stock:    0,
      price:    Number(form.price) || 0,
    }]);
  };

  const updateVariant = (i: number, field: keyof VariantForm, value: string | number) => {
    setVariants((vs) => vs.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  };

  const removeVariant = async (i: number) => {
    const v = variants[i];
    if (v.id) {
      const ok = await confirmAction({
        title:       "Remove Variant",
        message:     `Remove "${v.color}" variant? It will be permanently deleted when you save.`,
        confirmText: "Remove",
        variant:     "warning",
      });
      if (!ok) return;
    }
    setVariants((vs) => vs.filter((_, idx) => idx !== i));
  };

  // ─── Main save (everything at once) ───────────────────
  const handleSave = async () => {
    if (!form.name || !form.description || !form.sku || !form.price) {
      toast.error("Please fill all required fields", "Missing Information");
      return;
    }
    if (!form.waist) {
      toast.error("Waist measurement is required for denim products", "Missing Waist");
      return;
    }
    if (variants.length === 0) {
      toast.error("Add at least one color variant", "No Variants");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:         form.name,
          slug:         form.slug,
          sku:          form.sku,
          description:  form.description,
          price:        Number(form.price),
          comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
          collectionId: form.collectionId || null,
          status:       form.status,
          isNew:        form.isNew,
          isFeatured:   form.isFeatured,
          isBestSeller: form.isBestSeller,
          tags:         typeof form.tags === "string" ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : form.tags,
          waist:        Number(form.waist),
          length:       form.length !== "" ? Number(form.length) : null,
          bottom:       form.bottom !== "" ? Number(form.bottom) : null,
          images,
          variants:     variants.map((v) => ({
            id:       v.id,
            color:    v.color,
            colorHex: v.colorHex,
            sku:      v.sku,
            stock:    Number(v.stock),
            price:    Number(v.price),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save changes", "Save Failed");
        setSaving(false);
        return;
      }
      toast.success("Product updated successfully.", "Saved");
      setSaving(false);
      router.refresh();
    } catch {
      toast.error("Unable to connect to the server. Please try again.", "Network Error");
      setSaving(false);
    }
  };

  // ─── Header actions ───────────────────────────────────
  const handleDuplicate = async () => {
    const ok = await confirmAction({
      title:       "Duplicate Product",
      message:     `Create a copy of "${product.name}"? The duplicate will be saved as Draft.`,
      confirmText: "Duplicate",
      variant:     "info",
    });
    if (!ok) return;

    setBusy(true);
    const res  = await fetch(`/api/products/${product.id}/duplicate`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to duplicate product.", "Duplicate Failed");
      setBusy(false);
      return;
    }
    toast.success("Product duplicated as a new draft.", "Duplicated");
    router.push(`/products/${data.productId}`);
  };

  const handleDelete = async () => {
    const ok = await confirmAction({
      title:       "Delete Product",
      message:     `Permanently delete "${product.name}"? This will remove all variants and images. This action cannot be undone.`,
      confirmText: "Delete",
      variant:     "danger",
    });
    if (!ok) return;

    setBusy(true);
    const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`"${product.name}" has been removed.`, "Deleted");
      setTimeout(() => router.push("/products"), 600);
    } else {
      toast.error("Failed to delete product.", "Delete Failed");
      setBusy(false);
    }
  };

  // ─── Quick action helpers (write via same PATCH) ──────
  const patchField = async (updates: Record<string, unknown>): Promise<boolean> => {
    const res = await fetch(`/api/products/${product.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(updates),
    });
    return res.ok;
  };

  const handleCollectionChange = async (collectionId: string) => {
    setBusy(true);
    const ok = await patchField({ collectionId: collectionId || null });
    if (ok) {
      setForm((f) => ({ ...f, collectionId }));
      toast.success("Collection updated.", "Saved");
      router.refresh();
    } else toast.error("Failed to update collection.", "Update Failed");
    setBusy(false); setModal(null);
  };

  const handleDiscountChange = async (comparePricePaisa: number | null) => {
    setBusy(true);
    const rupees = comparePricePaisa ? comparePricePaisa / 100 : null;
    const ok = await patchField({ comparePrice: rupees });
    if (ok) {
      setForm((f) => ({ ...f, comparePrice: rupees ? rupees.toString() : "" }));
      toast.success(comparePricePaisa ? "Discount set." : "Discount removed.", "Saved");
      router.refresh();
    } else toast.error("Failed to update discount.", "Update Failed");
    setBusy(false); setModal(null);
  };

  const handleStatusChange = async (status: string) => {
    setBusy(true);
    const ok = await patchField({ status });
    if (ok) {
      setForm((f) => ({ ...f, status: status.toLowerCase() }));
      toast.success(`Status changed to ${status.toLowerCase()}.`, "Saved");
      router.refresh();
    } else toast.error("Failed to update status.", "Update Failed");
    setBusy(false); setModal(null);
  };

  const handleVariantStockUpdate = async (variantId: string, newStock: number): Promise<boolean> => {
    const res = await fetch(`/api/variants/${variantId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ stock: newStock }),
    });
    if (res.ok) {
      // reflect immediately in local variant state
      setVariants((vs) => vs.map((v) => v.id === variantId ? { ...v, stock: newStock } : v));
      router.refresh();
    }
    return res.ok;
  };

  return (
    <div className="max-w-6xl space-y-5">

      {/* ─── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/products" className="p-2 hover:bg-white border border-[#e5e7eb] transition-colors">
            <ArrowLeft size={16} className="text-[#6b7280]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#1a1a1a]">{product.name}</h1>
              <span className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide capitalize",
                PRODUCT_STATUS_COLORS[form.status])}>
                {form.status}
              </span>
            </div>
            <p className="text-xs text-[#6b7280] mt-0.5 font-mono">{product.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={busy || saving}>
            <Copy size={13} />Duplicate
          </Button>
          <a href={`http://localhost:3000/products/${product.slug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm"><ExternalLink size={13} />Preview</Button>
          </a>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving || busy}>
            <Save size={13} />{saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={busy || saving}>
            <Trash size={13} />Delete
          </Button>
        </div>
      </div>

      {/* ─── Main grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

        {/* Left column (form sections) */}
        <div className="space-y-5">

          <Section title="Basic Information">
            <FormField label="Product Name" required>
              <input type="text" value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="input" />
            </FormField>
            <FormField label="Description" required>
              <textarea rows={4} value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="input resize-y" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="SKU" required>
                <input type="text" value={form.sku}
                  onChange={(e) => updateField("sku", e.target.value.toUpperCase())}
                  className="input font-mono" />
              </FormField>
              <FormField label="Slug" required hint="Used in product URL">
                <div className="flex gap-2">
                  <input type="text" value={form.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                    className="input font-mono" />
                  <button type="button"
                    onClick={() => updateField("slug", slugify(form.name))}
                    className="text-[10px] font-semibold uppercase tracking-wider text-[#c9a96e] hover:text-[#b8955a] px-2 border border-[#e5e7eb] hover:border-[#c9a96e]">
                    Auto
                  </button>
                </div>
              </FormField>
            </div>
          </Section>

          <Section title="Product Images">
            <MultiImageUploader
              images={images}
              onChange={setImages}
              maxImages={8}
              type="product"
            />
          </Section>

          <Section title="Pricing">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Price (PKR)" required>
                <input type="number" value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  className="input" />
              </FormField>
              <FormField label="Compare Price (PKR)" hint="Original price for showing discount">
                <input type="number" value={form.comparePrice}
                  onChange={(e) => updateField("comparePrice", e.target.value)}
                  className="input" />
              </FormField>
            </div>
          </Section>

          <Section title="Measurements (inches)">
            <p className="text-xs text-[#6b7280] -mt-2">
              Each product is one specific waist x length combo. Customers select only color.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Waist" required hint="e.g. 32">
                <input type="number" step="0.5" min="0" value={form.waist}
                  onChange={(e) => updateField("waist", e.target.value)} className="input" />
              </FormField>
              <FormField label="Length" hint="e.g. 32">
                <input type="number" step="0.5" min="0" value={form.length}
                  onChange={(e) => updateField("length", e.target.value)} className="input" />
              </FormField>
              <FormField label="Bottom" hint="Leg opening, e.g. 14">
                <input type="number" step="0.5" min="0" value={form.bottom}
                  onChange={(e) => updateField("bottom", e.target.value)} className="input" />
              </FormField>
            </div>
          </Section>

          <Section title={`Color Variants (${variants.length})`}>
            <p className="text-xs text-[#6b7280] -mt-2">
              Add each wash/color this product comes in. Each has its own stock and SKU.
            </p>
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={v.id ?? `new-${i}`} className="bg-[#fafaf9] p-3 border border-[#e5e7eb] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#1a1a1a]">Variant {i + 1}</span>
                      {v.id && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 font-semibold uppercase tracking-wider">
                          Saved
                        </span>
                      )}
                      {!v.id && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-[#f5f0e8] text-[#c9a96e] font-semibold uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </div>
                    <button onClick={() => removeVariant(i)} className="text-red-500 hover:text-red-700">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldRow label="Color Name">
                      <input type="text" value={v.color}
                        onChange={(e) => updateVariant(i, "color", e.target.value)}
                        className="input text-xs" />
                    </FieldRow>

                    <FieldRow label="Color Swatch">
                      <div className="flex items-center gap-2">
                        <input type="color" value={v.colorHex}
                          onChange={(e) => updateVariant(i, "colorHex", e.target.value)}
                          className="w-10 h-8 border border-[#e5e7eb] cursor-pointer" />
                        <input type="text" value={v.colorHex}
                          onChange={(e) => updateVariant(i, "colorHex", e.target.value)}
                          className="input text-xs font-mono flex-1" />
                      </div>
                    </FieldRow>

                    <FieldRow label="SKU">
                      <input type="text" value={v.sku}
                        onChange={(e) => updateVariant(i, "sku", e.target.value.toUpperCase())}
                        className="input text-xs font-mono" />
                    </FieldRow>

                    <FieldRow label="Stock">
                      <input type="number" value={v.stock}
                        onChange={(e) => updateVariant(i, "stock", Number(e.target.value))}
                        className="input text-xs" />
                    </FieldRow>

                    <FieldRow label="Price (PKR)" className="sm:col-span-2">
                      <input type="number" value={v.price}
                        onChange={(e) => updateVariant(i, "price", Number(e.target.value))}
                        className="input text-xs" />
                    </FieldRow>
                  </div>
                </div>
              ))}
              <button onClick={addVariant}
                className="w-full py-2.5 text-xs font-medium text-[#c9a96e] hover:text-[#b8955a] border border-dashed border-[#e5e7eb] hover:border-[#c9a96e] transition-colors flex items-center justify-center gap-1">
                <Plus size={14} />Add Color Variant
              </button>
            </div>
          </Section>

        </div>

        {/* Right column (sidebar) */}
        <div className="space-y-5">

          <div className="bg-white border border-[#e5e7eb] p-5">
            <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-3">Quick Actions</h3>
            <div className="space-y-1">
              <QuickAction icon={Package}  label="Update Stock"      onClick={() => setModal("stock")}      />
              <QuickAction icon={Layers}   label="Change Collection" onClick={() => setModal("collection")} />
              <QuickAction icon={Percent}  label="Set Discount"      onClick={() => setModal("discount")}   />
              <QuickAction icon={Tag}      label="Change Status"     onClick={() => setModal("status")}     />
            </div>
          </div>

          <Section title="Status">
            <div className="space-y-2">
              {[
                { val: "draft",     label: "Draft",     desc: "Not visible to customers" },
                { val: "published", label: "Published", desc: "Visible on your store" },
                { val: "archived",  label: "Archived",  desc: "Hidden and read-only" },
              ].map((opt) => (
                <label key={opt.val} className="flex items-start gap-2 cursor-pointer">
                  <input type="radio" name="status" checked={form.status === opt.val}
                    onChange={() => updateField("status", opt.val)} className="accent-[#c9a96e] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a]">{opt.label}</p>
                    <p className="text-[11px] text-[#6b7280]">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </Section>

          <Section title="Organization">
            <FormField label="Collection">
              <select value={form.collectionId} onChange={(e) => updateField("collectionId", e.target.value)} className="input">
                <option value="">No collection</option>
                {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Tags" hint="Comma separated">
              <input type="text" value={form.tags} onChange={(e) => updateField("tags", e.target.value)}
                placeholder="denim, slim, casual" className="input" />
            </FormField>
          </Section>

          <Section title="Product Flags">
            <div className="space-y-2">
              {[
                { key: "isNew",        label: "Mark as New Arrival" },
                { key: "isFeatured",   label: "Feature on Homepage" },
                { key: "isBestSeller", label: "Best Seller" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox"
                    checked={form[key as keyof typeof form] as boolean}
                    onChange={(e) => updateField(key, e.target.checked)}
                    className="accent-[#c9a96e]" />
                  <span className="text-sm text-[#1a1a1a]">{label}</span>
                </label>
              ))}
            </div>
          </Section>

        </div>
      </div>

      {/* ─── Modals ────────────────────────────────── */}
      {modal === "stock" && (
        <StockModal
          variants={variants.filter((v) => !!v.id).map((v) => ({
            id: v.id!, sku: v.sku, color: v.color, colorHex: v.colorHex, stock: v.stock,
          }))}
          onClose={() => setModal(null)}
          onSave={handleVariantStockUpdate}
        />
      )}
      {modal === "collection" && (
        <CollectionModal
          currentId={form.collectionId}
          collections={collections}
          onClose={() => setModal(null)}
          onSave={handleCollectionChange}
        />
      )}
      {modal === "discount" && (
        <DiscountModal
          currentPricePaisa={product.price}
          currentCompareAtPaisa={product.comparePrice}
          onClose={() => setModal(null)}
          onSave={handleDiscountChange}
        />
      )}
      {modal === "status" && (
        <StatusModal
          currentStatus={form.status.toUpperCase()}
          onClose={() => setModal(null)}
          onSave={handleStatusChange}
        />
      )}

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          border: 1px solid #e5e7eb;
          background: white;
          outline: none;
          transition: border-color 0.15s;
        }
        :global(.input:focus) { border-color: #c9a96e; }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e5e7eb]">
      <div className="px-5 py-3 border-b border-[#e5e7eb]">
        <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function FormField({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#1a1a1a] mb-1.5">
        {label}{required && <span className="text-[#c9a96e] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-[#6b7280]">{hint}</p>}
    </div>
  );
}

function FieldRow({ label, children, className }: {
  label: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[10px] font-medium text-[#6b7280] uppercase tracking-wide mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function QuickAction({
  icon: Icon, label, onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#1a1a1a] hover:bg-[#fafaf9] hover:text-[#c9a96e] transition-colors group"
    >
      <Icon size={14} className="text-[#c9a96e]" />
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight size={14} className="text-[#c9a96e] opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

function ModalShell({
  title, onClose, children,
}: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md bg-white shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
            <h3 className="text-base font-bold text-[#1a1a1a]">{title}</h3>
            <button onClick={onClose} className="p-1 text-[#6b7280] hover:text-[#1a1a1a]">
              <X size={18} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

function StockModal({
  variants, onClose, onSave,
}: {
  variants: Array<{ id: string; sku: string; color: string; colorHex: string; stock: number }>;
  onClose:  () => void;
  onSave:   (variantId: string, stock: number) => Promise<boolean>;
}) {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(variants.map((v) => [v.id, v.stock]))
  );
  const [saving,  setSaving]  = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const toast  = useToastStore();

  const saveOne = async (variantId: string) => {
    setSaving(true);
    const ok = await onSave(variantId, values[variantId]);
    if (ok) {
      setSavedId(variantId);
      toast.success("Stock updated.", "Saved");
      setTimeout(() => setSavedId(null), 1500);
    } else {
      toast.error("Failed to update stock.", "Save Failed");
    }
    setSaving(false);
  };

  return (
    <ModalShell title="Update Stock" onClose={onClose}>
      <div className="p-5 space-y-3">
        {variants.length === 0 && (
          <p className="text-xs text-[#6b7280] py-4 text-center">
            No saved variants yet. Save the product first, then update stock here.
          </p>
        )}
        {variants.map((v) => (
          <div key={v.id} className="flex items-center gap-3 py-2">
            <span className="w-4 h-4 rounded-full border border-[#e5e7eb] flex-shrink-0" style={{ backgroundColor: v.colorHex }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1a1a1a]">{v.color}</p>
              <p className="text-[10px] text-[#6b7280] font-mono">{v.sku}</p>
            </div>
            <input
              type="number"
              value={values[v.id]}
              onChange={(e) => setValues((s) => ({ ...s, [v.id]: Number(e.target.value) }))}
              min={0}
              className="w-20 px-2 py-1.5 text-sm text-center border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none"
            />
            {savedId === v.id ? (
              <span className="text-xs text-green-600 flex items-center gap-1 w-14 justify-center">
                <Check size={12} /> Saved
              </span>
            ) : (
              <button
                onClick={() => saveOne(v.id)}
                disabled={saving || values[v.id] === v.stock}
                className="text-xs font-semibold text-[#c9a96e] hover:text-[#b8955a] underline w-14 text-center disabled:opacity-30 disabled:no-underline"
              >
                Save
              </button>
            )}
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

function CollectionModal({
  currentId, collections, onClose, onSave,
}: {
  currentId:   string;
  collections: Array<{ id: string; name: string }>;
  onClose:     () => void;
  onSave:      (id: string) => void;
}) {
  const [value, setValue] = useState(currentId);
  return (
    <ModalShell title="Change Collection" onClose={onClose}>
      <div className="p-5 space-y-4">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none"
        >
          <option value="">No collection</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="flex gap-2 pt-2 border-t border-[#e5e7eb]">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] hover:text-[#1a1a1a] border border-[#e5e7eb]">
            Cancel
          </button>
          <button onClick={() => onSave(value)}
            className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#1a1a1a] text-white hover:bg-[#c9a96e] transition-colors flex items-center justify-center gap-2">
            <Save size={12} />Save
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function DiscountModal({
  currentPricePaisa, currentCompareAtPaisa, onClose, onSave,
}: {
  currentPricePaisa:     number;
  currentCompareAtPaisa: number | null;
  onClose:               () => void;
  onSave:                (comparePricePaisa: number | null) => void;
}) {
  const priceRupees = currentPricePaisa / 100;
  const [mode,    setMode]    = useState<"none" | "percent" | "custom">(currentCompareAtPaisa ? "custom" : "none");
  const [percent, setPercent] = useState(currentCompareAtPaisa ? Math.round((1 - currentPricePaisa / currentCompareAtPaisa) * 100) : 20);
  const [custom,  setCustom]  = useState(currentCompareAtPaisa ? (currentCompareAtPaisa / 100).toString() : "");

  const submit = () => {
    if (mode === "none") {
      onSave(null);
    } else if (mode === "percent") {
      const factor = 1 - (percent / 100);
      if (factor <= 0) return;
      const compareAtRupees = priceRupees / factor;
      onSave(Math.round(compareAtRupees * 100));
    } else {
      const num = Number(custom);
      if (!num || num <= priceRupees) return;
      onSave(Math.round(num * 100));
    }
  };

  return (
    <ModalShell title="Set Discount" onClose={onClose}>
      <div className="p-5 space-y-4">
        <div className="bg-[#fafaf9] border border-[#e5e7eb] p-3 text-xs">
          <span className="text-[#6b7280]">Current price: </span>
          <span className="font-bold text-[#1a1a1a]">Rs. {priceRupees.toLocaleString()}</span>
        </div>

        <div className="space-y-2">
          {[
            { val: "none",    label: "No discount",              desc: "Remove any current discount" },
            { val: "percent", label: "Discount by percentage",   desc: "e.g. 20% off" },
            { val: "custom",  label: "Set original price",       desc: "Show a custom struck-through price" },
          ].map((opt) => (
            <label key={opt.val} className="flex items-start gap-2 p-3 border border-[#e5e7eb] cursor-pointer hover:border-[#c9a96e]">
              <input type="radio" name="mode" checked={mode === opt.val}
                onChange={() => setMode(opt.val as typeof mode)}
                className="accent-[#c9a96e] mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1a1a1a]">{opt.label}</p>
                <p className="text-[10px] text-[#6b7280]">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {mode === "percent" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#1a1a1a] mb-1.5">
              Discount Percentage
            </label>
            <div className="relative">
              <input type="number" value={percent} min={1} max={90}
                onChange={(e) => setPercent(Number(e.target.value))}
                className="w-full px-3 py-2.5 pr-8 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">%</span>
            </div>
            <p className="mt-1 text-[10px] text-[#6b7280]">
              Original price will show as{" "}
              <span className="font-semibold text-[#c9a96e]">
                Rs. {Math.round(priceRupees / (1 - percent / 100)).toLocaleString()}
              </span>
            </p>
          </div>
        )}

        {mode === "custom" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#1a1a1a] mb-1.5">
              Original Price (Rs.)
            </label>
            <input type="number" value={custom} min={priceRupees + 1}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g. 4500"
              className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none" />
            <p className="mt-1 text-[10px] text-[#6b7280]">Must be higher than current price</p>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-[#e5e7eb]">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] hover:text-[#1a1a1a] border border-[#e5e7eb]">
            Cancel
          </button>
          <button onClick={submit}
            className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#1a1a1a] text-white hover:bg-[#c9a96e] transition-colors flex items-center justify-center gap-2">
            <Save size={12} />Save
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function StatusModal({
  currentStatus, onClose, onSave,
}: {
  currentStatus: string;
  onClose:       () => void;
  onSave:        (status: string) => void;
}) {
  const [value, setValue] = useState(currentStatus);
  const options = [
    { val: "DRAFT",     label: "Draft",     desc: "Not visible to customers" },
    { val: "PUBLISHED", label: "Published", desc: "Visible on your store" },
    { val: "ARCHIVED",  label: "Archived",  desc: "Hidden and read-only" },
  ];

  return (
    <ModalShell title="Change Status" onClose={onClose}>
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          {options.map((opt) => (
            <label key={opt.val} className="flex items-start gap-2 p-3 border border-[#e5e7eb] cursor-pointer hover:border-[#c9a96e]">
              <input type="radio" name="status" checked={value === opt.val}
                onChange={() => setValue(opt.val)}
                className="accent-[#c9a96e] mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1a1a1a]">{opt.label}</p>
                <p className="text-[10px] text-[#6b7280]">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-2 pt-2 border-t border-[#e5e7eb]">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] hover:text-[#1a1a1a] border border-[#e5e7eb]">
            Cancel
          </button>
          <button onClick={() => onSave(value)}
            className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#1a1a1a] text-white hover:bg-[#c9a96e] transition-colors flex items-center justify-center gap-2">
            <Save size={12} />Save
          </button>
        </div>
      </div>
    </ModalShell>
  );
}