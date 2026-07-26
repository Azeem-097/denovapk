"use client";
import { useState } from "react";
import { MessageCircle, Save, CheckCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { WhatsAppEditor } from "@/components/ui/WhatsAppEditor";
import { parseWhatsAppSyntaxToHTML, renderTemplate } from "@/lib/messageTemplates";

interface Props {
  initialTemplates: {
    template_order_confirmation: string;
    template_abandoned_cart: string;
    template_promotional: string;
  };
}

type TabId = "order_confirmation" | "abandoned_cart" | "promotional";

const TABS = [
  { id: "order_confirmation", label: "Order Confirmation", key: "template_order_confirmation" },
  { id: "abandoned_cart",     label: "Abandoned Cart",     key: "template_abandoned_cart" },
  { id: "promotional",        label: "Promotional Offer",  key: "template_promotional" },
] as const;

// Variables + Sample data for preview
const TEMPLATE_CONFIGS = {
  order_confirmation: {
    vars: ["name", "orderNumber", "items", "total", "paymentMethod", "brandName"],
    sample: {
      name: "Ali Ahmed", orderNumber: "DNV987654", total: "10,500", paymentMethod: "Cash on Delivery", brandName: "Denova PK",
      items: "- Vintage Straight Leg x1\n- Classic White Tee x2"
    }
  },
  abandoned_cart: {
    vars: ["name", "itemCount", "amount", "cartLink", "brandName"],
    sample: {
      name: "Ali Ahmed", itemCount: 2, amount: "8,200", brandName: "Denova PK",
      cartLink: "https://denovapk.com/checkout/recover"
    }
  },
  promotional: {
    vars: ["name", "discount", "code", "expiryDate", "brandName"],
    sample: {
      name: "Ali Ahmed", discount: "20%", code: "SUMMER20", expiryDate: "Aug 30", brandName: "Denova PK"
    }
  }
};

export function MessageTemplatesClient({ initialTemplates }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("order_confirmation");
  const [templates, setTemplates] = useState(initialTemplates);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  const activeKey = `template_${activeTab}` as keyof typeof templates;
  const currentTemplate = templates[activeKey];
  const config = TEMPLATE_CONFIGS[activeTab];

  // Render preview HTML
  const renderedMessage = renderTemplate(currentTemplate, config.sample);
  const previewHtml = parseWhatsAppSyntaxToHTML(renderedMessage);

  const handleChange = (val: string) => {
    setTemplates(prev => ({ ...prev, [activeKey]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(templates).map(([key, value]) => ({
        key, value, category: "templates",
      }));
      
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
      });
      
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <MessageCircle size={22} className="text-[#E10600]" />
            WhatsApp Templates
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Manage automated WhatsApp messages sent to customers.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
          {saved ? <><CheckCircle size={15} />Saved!</> : <><Save size={15} />{saving ? "Saving..." : "Save Changes"}</>}
        </Button>
      </div>

      <div className="flex items-center gap-1 border-b border-[#e5e7eb]">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold tracking-wide transition-colors border-b-2 -mb-px",
              activeTab === t.id ? "border-[#E10600] text-[#1a1a1a]" : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
        
        {/* LEFT: EDITOR */}
        <div className="space-y-4">
          <div className="bg-white border border-[#e5e7eb] p-5 rounded-md shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-4">
              Edit Template
            </h3>
            
            <WhatsAppEditor 
              value={currentTemplate} 
              onChange={handleChange} 
              variables={config.vars} 
            />
            
            <div className="mt-4 bg-[#fafaf9] p-3 rounded border border-[#e5e7eb] text-[11px] text-[#6b7280]">
              <p className="font-semibold text-[#1a1a1a] mb-1">Formatting Note:</p>
              <p>WhatsApp supports *bold*, _italic_, and ~strikethrough~. Underline is not supported by WhatsApp natively.</p>
            </div>
          </div>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="bg-white border border-[#e5e7eb] p-5 rounded-md shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone size={16} className="text-[#E10600]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">
              Live Preview
            </h3>
          </div>
          
          <div className="bg-[#efeae2] rounded-xl p-4 sm:p-6 overflow-hidden relative shadow-inner">
            {/* WhatsApp Chat Bubble */}
            <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-[0_1px_1px_rgba(0,0,0,0.05)] w-[85%] relative border border-[#e5e7eb]">
              <div 
                className="text-[13px] sm:text-sm text-[#111111] whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{ __html: previewHtml || "<i>Empty message</i>" }}
              />
              <p className="text-[9px] text-[#6b7280] text-right mt-1 pt-1 opacity-70">
                12:00 PM
              </p>
            </div>
          </div>
          
          <p className="text-[10px] text-center text-[#6b7280] mt-3">
            Preview populated with sample customer data.
          </p>
        </div>

      </div>
    </div>
  );
}