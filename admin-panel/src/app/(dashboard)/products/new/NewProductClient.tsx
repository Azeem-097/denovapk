"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/utils";
import { MultiImageUploader } from "@/components/ui/MultiImageUploader";
import { BackgroundColorPicker } from "@/components/ui/BackgroundColorPicker";
import { useToastStore } from "@/store/toastStore";

interface Variant {
  color: string; colorHex: string; sku: string; stock: number; price: number;
}

interface MeasurementForm {
  waist: string;
  length: string;
  bottom: string;
}

export function NewProductClient({ collections }: { collections: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const toast  = useToastStore();

  const [form, setForm] = useState({
    name:         "",
    slug:         "",
    brand:        "",
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
    images:       [] as string[],
    bgColor:      null as string | null,
  });
  const [measurements, setMeasurements] = useState<MeasurementForm[]>([
    { waist: "32", length: "32", bottom: "14" },
  ]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [saving,   setSaving]   = useState(false);

  const updateField = (field: string, value: string | boolean | null) => {
    setForm((f) => {
      const updated = { ...f, [field]: value };
      if (field === "name" && !f.slug) updated.slug = slugify(value as string);
      return updated;
    });
  };

  const addVariant = () => {
    setVariants([...variants, {
      color: "Dark Blue", colorHex: "#1e3a5f",
      sku: `${form.sku || "SKU"}-DB`, stock: 10,
      price: Number(form.price) || 0,
    }]);
  };

  const updateVariant = (i: number, field: keyof Variant, value: string | number) => {
    setVariants((vs) => vs.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  };

  const removeVariant = (i: number) => setVariants((vs) => vs.filter((_, idx) => idx !== i));

  const addMeasurement = () => {
    setMeasurements((rows) => [...rows, { waist: "", length: "", bottom: "" }]);
  };

  const updateMeasurement = (index: number, field: keyof MeasurementForm, value: string) => {
    setMeasurements((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  };

  const removeMeasurement = (index: number) => {
    setMeasurements((rows) => (rows.length > 1 ? rows.filter((_, rowIndex) => rowIndex !== index) : rows));
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.sku || !form.price) {
      toast.error("Please fill all required fields", "Missing Information");
      return;
    }
    const normalizedMeasurements = measurements
      .map((row) => ({
        waist: row.waist.trim(),
        length: row.length.trim(),
        bottom: row.bottom.trim(),
      }))
      .filter((row) => row.waist.length > 0);

    if (normalizedMeasurements.length === 0) {
      toast.error("Add at least one waist size for denim products", "Missing Waist");
      return;
    }
    if (variants.length === 0) {
      toast.error("Add at least one color variant", "No Variants");
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
          waist:        Number(normalizedMeasurements[0].waist),
          length:       normalizedMeasurements[0].length !== "" ? Number(normalizedMeasurements[0].length) : null,
          bottom:       normalizedMeasurements[0].bottom !== "" ? Number(normalizedMeasurements[0].bottom) : null,
          measurements: normalizedMeasurements,
          bgColor:      form.bgColor,
          brand:        form.brand.trim() || null,
          tags:         form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          variants,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save product", "Save Failed");
        setSaving(false);
        return;
      }
      toast.success(`${form.name} has been added to your catalog.`, "Product Created");
      setTimeout(() => router.push("/products"), 800);
    } catch {
      toast.error("Unable to connect to the server. Please try again.", "Network Error");
      setSaving(false);
    }
  };

  const previewImage = form.images[0] || form.imageUrl;

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/products" className="p-2 hover:bg-white border border-[#e5e7eb] transition-colors">
            <ArrowLeft size={16} className="text-[#6b7280]" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#1a1a1a]">Add New Product</h1>
            <p className="text-xs text-[#6b7280] mt-0.5">Create a new denim product</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">

          <Section title="Basic Information">
            <FormField label="Product Name" required>
              <input type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Slim Fit Selvedge Jeans" className="input" />
            </FormField>

            <FormField label="Brand Name" hint="e.g. Zara, Levi's, Denova (shown on product page above price)">
              <input type="text" value={form.brand}
                onChange={(e) => updateField("brand", e.target.value)}
                placeholder="Zara" className="input" />
            </FormField>

            <FormField label="Description" required>
              <textarea rows={4} value={form.description} onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe the product..." className="input resize-y" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="SKU" required>
                <input type="text" value={form.sku} onChange={(e) => updateField("sku", e.target.value.toUpperCase())}
                  placeholder="DNM-001" className="input font-mono" />
              </FormField>
              <FormField label="Slug" required>
                <input type="text" value={form.slug} onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="slim-fit-selvedge-jeans" className="input font-mono" />
              </FormField>
            </div>
          </Section>

          <Section title="Product Images">
            <MultiImageUploader
              images={form.images}
              onChange={(imgs) => setForm((f) => ({ ...f, images: imgs, imageUrl: imgs[0] || "" }))}
              maxImages={8}
              type="product"
            />
          </Section>

          <Section title="Image Background">
            <p className="text-xs text-[#6b7280] -mt-2">
              Replace the white background of product images with a custom color. The jeans themselves stay unchanged.
            </p>
            <BackgroundColorPicker
              value={form.bgColor}
              onChange={(v) => updateField("bgColor", v)}
              previewImage={previewImage}
            />
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

          <Section title="Measurements (inches)">
            <p className="text-xs text-[#6b7280] -mt-2">
              Add every waist size you want to sell. Waist is selectable on the product page; length and bottom are extra details.
            </p>
            <div className="space-y-3">
              {measurements.map((row, index) => (
                <div key={index} className="rounded-xl border border-[#e5e7eb] bg-[#fafaf9] p-3">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-xs font-semibold tracking-wide uppercase text-[#1a1a1a]">Size {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeMeasurement(index)}
                      disabled={measurements.length === 1}
                      className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormField label="Waist" required hint="e.g. 32">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={row.waist}
                        onChange={(e) => updateMeasurement(index, "waist", e.target.value)}
                        placeholder="32"
                        className="input"
                      />
                    </FormField>
                    <FormField label="Length" hint="e.g. 32">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={row.length}
                        onChange={(e) => updateMeasurement(index, "length", e.target.value)}
                        placeholder="32"
                        className="input"
                      />
                    </FormField>
                    <FormField label="Bottom" hint="Leg opening, e.g. 14">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={row.bottom}
                        onChange={(e) => updateMeasurement(index, "bottom", e.target.value)}
                        placeholder="14"
                        className="input"
                      />
                    </FormField>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addMeasurement}
                className="w-full border border-dashed border-[#cbd5e1] bg-white text-[#3b5f8f] font-medium py-3 flex items-center justify-center gap-2 hover:bg-[#fafaf9] transition-colors"
              >
                <Plus size={14} />
                Add Size
              </button>
            </div>
          </Section>

          <Section title={`Color Variants (${variants.length})`}>
            <p className="text-xs text-[#6b7280] -mt-2">
              Add each wash/color this product comes in. Each has its own stock and SKU.
            </p>
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="bg-[#fafaf9] p-3 border border-[#e5e7eb] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1a1a1a]">Variant {i + 1}</span>
                    <button onClick={() => removeVariant(i)} className="text-red-500 hover:text-red-700">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldRow label="Color Name">
                      <input type="text" value={v.color}
                        onChange={(e) => updateVariant(i, "color", e.target.value)}
                        placeholder="e.g. Dark Indigo" className="input text-xs" />
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
                        placeholder="DNM-001-DB" className="input text-xs font-mono" />
                    </FieldRow>

                    <FieldRow label="Stock">
                      <input type="number" value={v.stock}
                        onChange={(e) => updateVariant(i, "stock", Number(e.target.value))}
                        placeholder="10" className="input text-xs" />
                    </FieldRow>

                    <FieldRow label="Price (PKR)" className="sm:col-span-2">
                      <input type="number" value={v.price}
                        onChange={(e) => updateVariant(i, "price", Number(e.target.value))}
                        placeholder="3500" className="input text-xs" />
                    </FieldRow>
                  </div>
                </div>
              ))}
              <button onClick={addVariant}
                className="w-full py-2.5 text-xs font-medium text-[#3b5f8f] hover:text-[#2d4a72] border border-dashed border-[#e5e7eb] hover:border-[#3b5f8f] transition-colors flex items-center justify-center gap-1">
                <Plus size={14} />Add Color Variant
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
                    onChange={() => updateField("status", opt.val)} className="accent-[#3b5f8f] mt-0.5" />
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
                    className="accent-[#3b5f8f]" />
                  <span className="text-sm text-[#1a1a1a]">{label}</span>
                </label>
              ))}
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
        :global(.input:focus) { border-color: #3b5f8f; }
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

function FormField({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#1a1a1a] mb-1.5">
        {label}{required && <span className="text-[#3b5f8f] ml-0.5">*</span>}
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