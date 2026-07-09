"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/utils";

interface Variant {
  size: string; color: string; colorHex: string; sku: string; stock: number; price: number;
}

export function NewProductClient({ collections }: { collections: Array<{ id: string; name: string }> }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name:         "",
    slug:         "",
    sku:          "",
    description:  "",
    price:        "",
    comparePrice: "",
    collectionId: "",
    status:       "draft",
    isNew:        false,
    isFeatured:   false,
    isBestSeller: false,
    tags:         "",
    imageUrl:     "",
  });
  const [variants, setVariants] = useState<Variant[]>([]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const updateField = (field: string, value: string | boolean) => {
    setForm((f) => {
      const updated = { ...f, [field]: value };
      // Auto-generate slug from name
      if (field === "name" && !f.slug) {
        updated.slug = slugify(value as string);
      }
      return updated;
    });
  };

  const addVariant = () => {
    setVariants([...variants, {
      size:  "M", color: "White", colorHex: "#ffffff", sku: `${form.sku || "SKU"}-M-W`,
      stock: 10, price: Number(form.price) || 0,
    }]);
  };

  const updateVariant = (i: number, field: keyof Variant, value: string | number) => {
    setVariants((vs) => vs.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  };

  const removeVariant = (i: number) => {
    setVariants((vs) => vs.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    setError("");

    if (!form.name || !form.description || !form.sku || !form.price) {
      setError("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...form,
          price:        Number(form.price),
          comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
          tags:         form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          variants,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
        setSaving(false);
        return;
      }

      alert("Product created successfully!");
      router.push("/products");
    } catch {
      setError("Network error");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/products" className="p-2 hover:bg-white border border-[#e5e7eb] transition-colors">
            <ArrowLeft size={16} className="text-[#6b7280]" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#1a1a1a]">Add New Product</h1>
            <p className="text-xs text-[#6b7280] mt-0.5">Create a new product for your catalog</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/products")}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            <Save size={14} />
            {saving ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">

          <Section title="Basic Information">
            <FormField label="Product Name" required>
              <input type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Classic Linen Kurta" className="input" />
            </FormField>
            <FormField label="Description" required>
              <textarea rows={4} value={form.description} onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe the product..." className="input resize-y" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="SKU" required>
                <input type="text" value={form.sku} onChange={(e) => updateField("sku", e.target.value.toUpperCase())}
                  placeholder="CLK-001" className="input font-mono" />
              </FormField>
              <FormField label="Slug" required>
                <input type="text" value={form.slug} onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="classic-linen-kurta" className="input font-mono" />
              </FormField>
            </div>
          </Section>

          <Section title="Product Image">
            <FormField label="Image URL" hint="Paste a full image URL (e.g., from Unsplash or Cloudinary)">
              <input type="url" value={form.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)}
                placeholder="https://images.unsplash.com/..." className="input" />
            </FormField>
            {form.imageUrl && (
              <div className="mt-3 w-32 h-40 bg-[#fafaf9] border border-[#e5e7eb]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </Section>

          <Section title="Pricing">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Price (PKR)" required>
                <input type="number" value={form.price} onChange={(e) => updateField("price", e.target.value)}
                  placeholder="3500" className="input" />
              </FormField>
              <FormField label="Compare Price (PKR)" hint="Original price for showing discount">
                <input type="number" value={form.comparePrice} onChange={(e) => updateField("comparePrice", e.target.value)}
                  placeholder="4500" className="input" />
              </FormField>
            </div>
          </Section>

          <Section title={`Variants (${variants.length})`}>
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="bg-[#fafaf9] p-3 border border-[#e5e7eb] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1a1a1a]">Variant {i + 1}</span>
                    <button onClick={() => removeVariant(i)} className="text-red-500 hover:text-red-700"><X size={14} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} className="input text-xs">
                      {["XS", "S", "M", "L", "XL", "XXL"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="text" value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} placeholder="Color name" className="input text-xs" />
                    <input type="color" value={v.colorHex} onChange={(e) => updateVariant(i, "colorHex", e.target.value)} className="input h-8" />
                    <input type="text" value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value.toUpperCase())} placeholder="SKU" className="input text-xs font-mono" />
                    <input type="number" value={v.stock} onChange={(e) => updateVariant(i, "stock", Number(e.target.value))} placeholder="Stock" className="input text-xs" />
                    <input type="number" value={v.price} onChange={(e) => updateVariant(i, "price", Number(e.target.value))} placeholder="Price (PKR)" className="input text-xs" />
                  </div>
                </div>
              ))}
              <button onClick={addVariant} className="w-full py-2.5 text-xs font-medium text-[#c9a96e] hover:text-[#b8955a] border border-dashed border-[#e5e7eb] hover:border-[#c9a96e] transition-colors flex items-center justify-center gap-1">
                <Plus size={14} />Add Variant
              </button>
            </div>
          </Section>

        </div>

        <div className="space-y-5">
          <Section title="Status">
            <div className="space-y-2">
              {[
                { val: "draft",     label: "Draft",     desc: "Not visible to customers" },
                { val: "published", label: "Published", desc: "Visible on your store" },
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
                placeholder="linen, summer, casual" className="input" />
            </FormField>
          </Section>

          <Section title="Product Flags">
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isNew} onChange={(e) => updateField("isNew", e.target.checked)} className="accent-[#c9a96e]" />
                <span className="text-sm text-[#1a1a1a]">Mark as New Arrival</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => updateField("isFeatured", e.target.checked)} className="accent-[#c9a96e]" />
                <span className="text-sm text-[#1a1a1a]">Feature on Homepage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isBestSeller} onChange={(e) => updateField("isBestSeller", e.target.checked)} className="accent-[#c9a96e]" />
                <span className="text-sm text-[#1a1a1a]">Best Seller</span>
              </label>
            </div>
          </Section>
        </div>
      </div>

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
        :global(.input:focus) {
          border-color: #c9a96e;
        }
      `}</style>
    </div>
  );
}

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

function FormField({
  label, required, hint, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#1a1a1a] mb-1.5">
        {label}
        {required && <span className="text-[#c9a96e] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-[#6b7280]">{hint}</p>}
    </div>
  );
}