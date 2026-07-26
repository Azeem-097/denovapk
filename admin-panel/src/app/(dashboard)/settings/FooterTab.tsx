"use client";
import { FileText } from "lucide-react";

interface TabProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

function Field({
  label, id, value, onChange, type = "text", hint, rows,
}: {
  label: string; id: string; value: string;
  onChange: (v: string) => void;
  type?: string; hint?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide uppercase text-[#1a1a1a] mb-1.5">
        {label}
      </label>
      {rows ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
          className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none resize-y font-mono" />
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none" />
      )}
      {hint && <p className="mt-1 text-[11px] text-[#6b7280]">{hint}</p>}
    </div>
  );
}

export function FooterTab({ settings, onChange }: TabProps) {
  const parseLinks = (json: string): Array<{ label: string; href: string }> => {
    try { return JSON.parse(json); } catch { return []; }
  };

  const updateLink = (key: string, index: number, field: "label" | "href", value: string) => {
    const links = parseLinks(settings[key] ?? "[]");
    if (links[index]) {
      links[index][field] = value;
      onChange(key, JSON.stringify(links));
    }
  };

  const addLink = (key: string) => {
    const links = parseLinks(settings[key] ?? "[]");
    links.push({ label: "New Link", href: "/" });
    onChange(key, JSON.stringify(links));
  };

  const removeLink = (key: string, index: number) => {
    const links = parseLinks(settings[key] ?? "[]");
    links.splice(index, 1);
    onChange(key, JSON.stringify(links));
  };

  const LinkEditor = ({ settingKey, title }: { settingKey: string; title: string }) => {
    const links = parseLinks(settings[settingKey] ?? "[]");
    return (
      <div className="border border-[#e5e7eb] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#E10600]">{title}</p>
          <button type="button" onClick={() => addLink(settingKey)}
            className="text-[10px] font-semibold text-[#E10600] hover:text-[#B80000] underline">
            + Add Link
          </button>
        </div>
        {links.length === 0 ? (
          <p className="text-xs text-[#6b7280] italic">No links. Click &quot;+ Add Link&quot;.</p>
        ) : (
          <div className="space-y-2">
            {links.map((link, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#fafaf9] p-2 border border-[#e5e7eb]">
                <input type="text" value={link.label} placeholder="Label"
                  onChange={(e) => updateLink(settingKey, i, "label", e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none" />
                <input type="text" value={link.href} placeholder="/page-url"
                  onChange={(e) => updateLink(settingKey, i, "href", e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none font-mono" />
                <button type="button" onClick={() => removeLink(settingKey, i)}
                  className="text-red-500 hover:text-red-700 text-xs px-1" title="Remove">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-base font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <FileText size={16} className="text-[#E10600]" />
        Footer Content
      </h2>
      <p className="text-xs text-[#6b7280] mb-6">
        Customize footer text, links, and columns. Changes apply within 60 seconds.
      </p>

      <div className="space-y-6">
        {/* Brand section */}
        <div className="border border-[#e5e7eb] p-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#E10600]">Brand Section</p>
          <Field label="Brand Description" id="footer_brand_description"
            value={settings.footer_brand_description ?? ""}
            onChange={(v) => onChange("footer_brand_description", v)} rows={3}
            hint="Shown below the logo in the footer" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Copyright Text" id="footer_copyright"
              value={settings.footer_copyright ?? ""}
              onChange={(v) => onChange("footer_copyright", v)}
              hint="Text shown after the year" />
            <Field label="Payment Methods" id="footer_payment_methods"
              value={settings.footer_payment_methods ?? ""}
              onChange={(v) => onChange("footer_payment_methods", v)}
              hint="e.g. JazzCash | EasyPaisa | COD" />
          </div>
        </div>

        {/* 4 Link Columns */}
        {[
          { num: 1, titleKey: "footer_col1_title", linksKey: "footer_col1_links" },
          { num: 2, titleKey: "footer_col2_title", linksKey: "footer_col2_links" },
          { num: 3, titleKey: "footer_col3_title", linksKey: "footer_col3_links" },
          { num: 4, titleKey: "footer_col4_title", linksKey: "footer_col4_links" },
        ].map(({ num, titleKey, linksKey }) => (
          <div key={num} className="space-y-3">
            <Field label={`Column ${num} Title`} id={titleKey}
              value={settings[titleKey] ?? ""}
              onChange={(v) => onChange(titleKey, v)} />
            <LinkEditor settingKey={linksKey} title={`Column ${num} Links`} />
          </div>
        ))}

        {/* Bottom bar links */}
        <LinkEditor settingKey="footer_bottom_links" title="Bottom Bar Links" />

        <div className="bg-[#f5f0e8] border border-[#E10600]/30 p-4 text-xs text-[#1a1a1a]">
          <p className="font-semibold mb-1">Note</p>
          <p className="text-[#6b7280]">
            Contact info and social media links are managed in their respective tabs. Footer changes take effect within 60 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}