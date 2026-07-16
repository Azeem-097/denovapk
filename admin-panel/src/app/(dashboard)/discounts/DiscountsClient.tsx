"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Copy, MoreVertical, Trash, Edit, X, Save, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate, cn } from "@/lib/utils";
import { formatPaisa } from "@/lib/priceUtils";
import { useToastStore } from "@/store/toastStore";
import { confirmAction } from "@/store/confirmStore";
import type { DbDiscount } from "@/lib/db/types";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:   "bg-green-100 text-green-700",
  EXPIRED:  "bg-gray-100 text-gray-700",
  DISABLED: "bg-red-100 text-red-700",
};

export function DiscountsClient({ initialDiscounts }: { initialDiscounts: DbDiscount[] }) {
  const router = useRouter();
  const toast  = useToastStore();
  const [discounts, setDiscounts] = useState(initialDiscounts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<DbDiscount | null>(null);
  const [menuOpen, setMenuOpen]   = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code "${code}" copied to clipboard.`, "Copied");
  };

  const handleDelete = async (disc: DbDiscount) => {
    const ok = await confirmAction({
      title:       "Delete Discount Code",
      message:     `Delete "${disc.code}"? This code will no longer work at checkout. This action cannot be undone.`,
      confirmText: "Delete",
      variant:     "danger",
    });
    if (!ok) return;

    const res = await fetch(`/api/discounts/${disc.id}`, { method: "DELETE" });
    if (res.ok) {
      setDiscounts((d) => d.filter((x) => x.id !== disc.id));
      setMenuOpen(null);
      toast.success(`Discount code "${disc.code}" removed.`, "Deleted");
    } else {
      toast.error("Failed to delete discount code.", "Delete Failed");
    }
  };

  const handleToggleStatus = async (disc: DbDiscount) => {
    const newStatus = disc.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    const res = await fetch(`/api/discounts/${disc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setDiscounts((d) => d.map((x) => x.id === disc.id ? { ...x, status: newStatus } : x));
      setMenuOpen(null);
      toast.success(
        `"${disc.code}" is now ${newStatus.toLowerCase()}.`,
        newStatus === "ACTIVE" ? "Enabled" : "Disabled"
      );
    }
  };

  const handleSave = async (data: DiscountFormData) => {
    if (editing) {
      const res = await fetch(`/api/discounts/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.refresh();
        setModalOpen(false);
        setEditing(null);
        const r = await fetch("/api/discounts");
        const d = await r.json();
        if (d.discounts) setDiscounts(d.discounts);
        toast.success(`Discount code "${data.code}" updated.`, "Saved");
      }
    } else {
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to create discount code.", "Save Failed");
        return;
      }
      setModalOpen(false);
      const r = await fetch("/api/discounts");
      const d = await r.json();
      if (d.discounts) setDiscounts(d.discounts);
      toast.success(`Discount code "${data.code}" is now active.`, "Created");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Discounts</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Create and manage discount codes.</p>
        </div>
        <Button variant="primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus size={14} />
          Create Discount
        </Button>
      </div>

      <div className="bg-white border border-[#e5e7eb] overflow-hidden">
        {discounts.length === 0 ? (
          <div className="p-12 text-center">
            <Tag size={40} className="text-[#c9a96e] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#1a1a1a]">No discount codes yet</p>
            <p className="text-xs text-[#6b7280] mt-1">Create your first discount code to attract customers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#fafaf9]">
                  {["Code", "Type", "Value", "Min Order", "Uses", "Expires", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {discounts.map((d) => (
                  <tr key={d.id} className="hover:bg-[#fafaf9]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#c9a96e]">{d.code}</span>
                        <button onClick={() => copyCode(d.code)} className="text-[#6b7280] hover:text-[#1a1a1a]">
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#1a1a1a] capitalize">{d.type.toLowerCase()}</td>
                    <td className="px-4 py-3 text-xs font-bold text-[#1a1a1a]">
                      {d.type === "PERCENTAGE" ? `${d.value}%` : formatPaisa(d.value)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6b7280]">{formatPaisa(d.minOrder)}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-[#1a1a1a]">{d.usedCount} / {d.maxUses}</p>
                      <div className="w-20 h-1 bg-[#e5e7eb] mt-1">
                        <div className="h-full bg-[#c9a96e]" style={{ width: `${Math.min((d.usedCount / d.maxUses) * 100, 100)}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6b7280]">
                      {formatDate(new Date(d.expiresAt * 1000).toISOString())}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn(STATUS_COLORS[d.status], "capitalize")}>
                        {d.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 relative">
                      <button onClick={() => setMenuOpen(menuOpen === d.id ? null : d.id)}
                        className="text-[#6b7280] hover:text-[#1a1a1a]">
                        <MoreVertical size={14} />
                      </button>
                      {menuOpen === d.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                          <div className="absolute right-4 top-full mt-1 w-44 bg-white border border-[#e5e7eb] shadow-lg z-20 py-1">
                            <button onClick={() => { setEditing(d); setModalOpen(true); setMenuOpen(null); }}
                              className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-[#1a1a1a] hover:bg-[#fafaf9]">
                              <Edit size={12} /> Edit
                            </button>
                            <button onClick={() => handleToggleStatus(d)}
                              className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-[#1a1a1a] hover:bg-[#fafaf9]">
                              {d.status === "ACTIVE" ? "Disable" : "Enable"}
                            </button>
                            <div className="border-t border-[#e5e7eb] my-1" />
                            <button onClick={() => handleDelete(d)}
                              className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50">
                              <Trash size={12} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <DiscountModal
          discount={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

interface DiscountFormData {
  code:      string;
  type:      string;
  value:     number;
  minOrder:  number;
  maxUses:   number;
  expiresAt: string;
  status:    string;
}

function DiscountModal({
  discount, onClose, onSave,
}: {
  discount: DbDiscount | null;
  onClose: () => void;
  onSave: (data: DiscountFormData) => void;
}) {
  const toast = useToastStore();
  const [form, setForm] = useState<DiscountFormData>({
    code:      discount?.code ?? "",
    type:      discount?.type ?? "PERCENTAGE",
    value:     discount?.value ?? 10,
    minOrder:  discount ? discount.minOrder / 100 : 0,
    maxUses:   discount?.maxUses ?? 1000,
    expiresAt: discount
      ? new Date(discount.expiresAt * 1000).toISOString().split("T")[0]
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status:    discount?.status ?? "ACTIVE",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error("Please enter a discount code.", "Code Required");
      return;
    }
    setSaving(true);
    await onSave({
      ...form,
      code: form.code.toUpperCase(),
      minOrder: form.type === "FIXED" ? form.minOrder * 100 : form.minOrder * 100,
      value: form.type === "FIXED" ? form.value * 100 : form.value,
    });
    setSaving(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-lg bg-white shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">

          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
            <h2 className="text-lg font-bold text-[#1a1a1a]">
              {discount ? "Edit Discount" : "Create Discount"}
            </h2>
            <button onClick={onClose} className="p-1 text-[#6b7280] hover:text-[#1a1a1a]">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#1a1a1a] mb-1.5">
                Discount Code *
              </label>
              <input type="text" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SUMMER20" required
                className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none font-mono uppercase" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#1a1a1a] mb-1.5">
                  Type *
                </label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none">
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (Rs.)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#1a1a1a] mb-1.5">
                  {form.type === "PERCENTAGE" ? "Discount (%)" : "Discount (Rs.)"}
                </label>
                <input type="number" value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                  min={0} required
                  className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#1a1a1a] mb-1.5">
                  Min Order (Rs.)
                </label>
                <input type="number" value={form.minOrder}
                  onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })}
                  min={0}
                  className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#1a1a1a] mb-1.5">
                  Max Uses
                </label>
                <input type="number" value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
                  min={1}
                  className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#1a1a1a] mb-1.5">
                  Expires On
                </label>
                <input type="date" value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#1a1a1a] mb-1.5">
                  Status
                </label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none">
                  <option value="ACTIVE">Active</option>
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>
            </div>

            <div className="bg-[#fafaf9] border border-[#e5e7eb] p-4 text-xs text-[#6b7280]">
              <p className="font-semibold text-[#1a1a1a] mb-1">Preview</p>
              <p>
                Code <span className="font-mono font-bold text-[#c9a96e]">{form.code || "CODE"}</span> gives{" "}
                <span className="font-bold text-[#1a1a1a]">
                  {form.type === "PERCENTAGE" ? `${form.value}% off` : `Rs. ${form.value} off`}
                </span>
                {form.minOrder > 0 && <> on orders above <span className="font-bold">Rs. {form.minOrder}</span></>}
                {". "}
                Can be used {form.maxUses} times.
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#e5e7eb]">
              <button type="button" onClick={onClose} disabled={saving}
                className="flex-1 py-3 text-sm font-medium border border-[#e5e7eb] text-[#6b7280] hover:text-[#1a1a1a] transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-3 text-sm font-semibold bg-[#1a1a1a] text-white hover:bg-[#c9a96e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={14} />
                {saving ? "Saving..." : (discount ? "Update" : "Create")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}