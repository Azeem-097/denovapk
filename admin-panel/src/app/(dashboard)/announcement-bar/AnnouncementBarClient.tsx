"use client";
import { useState, useRef } from "react";
import {
  Megaphone, Plus, GripVertical, Trash2, Eye, EyeOff,
  Save, Loader, X, Palette, Clock, Info, Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useToastStore }   from "@/store/toastStore";
import { useConfirmStore } from "@/store/confirmStore";

// ─── Types ───────────────────────────────────────────────
interface AnnouncementMessage {
  id:        string;
  text:      string;
  link:      string;
  isActive:  boolean;
  sortOrder: number;
}

interface AnnouncementConfig {
  enabled:           boolean;
  autoRotateSeconds: number;
  dismissible:       boolean;
  bgColor:           string;
  textColor:         string;
  accentColor:       string;
  messages:          AnnouncementMessage[];
}

function genId(): string {
  return "m" + Math.random().toString(36).slice(2, 12);
}

function emptyMessage(): AnnouncementMessage {
  return {
    id:        genId(),
    text:      "",
    link:      "",
    isActive:  true,
    sortOrder: 0,
  };
}

// ─── Props ───────────────────────────────────────────────
interface Props {
  initialConfig: AnnouncementConfig;
}

// ══════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════
export function AnnouncementBarClient({ initialConfig }: Props) {
  const [config,     setConfig]     = useState<AnnouncementConfig>(initialConfig);
  const [saving,     setSaving]     = useState(false);
  const [dirty,      setDirty]      = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);

  const toast   = useToastStore();
  const confirm = useConfirmStore();

  // ── Update helpers ────────────────────────────────────
  const updateConfig = <K extends keyof AnnouncementConfig>(key: K, value: AnnouncementConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const updateMessage = (id: string, field: keyof AnnouncementMessage, value: string | boolean | number) => {
    setConfig((prev) => ({
      ...prev,
      messages: prev.messages.map((m) => m.id === id ? { ...m, [field]: value } : m),
    }));
    setDirty(true);
  };

  const addMessage = () => {
    const newMsg = { ...emptyMessage(), sortOrder: config.messages.length };
    setConfig((prev) => ({ ...prev, messages: [...prev.messages, newMsg] }));
    setDirty(true);
  };

  const deleteMessage = async (id: string) => {
    const msg = config.messages.find((m) => m.id === id);
    if (!msg) return;

    const ok = await confirm.confirm({
      title:       "Delete Message",
      message:     `Delete "${msg.text || "this message"}"? This cannot be undone.`,
      confirmText: "Delete",
      variant:     "danger",
    });
    if (!ok) return;

    setConfig((prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => m.id !== id),
    }));
    setDirty(true);
    toast.success("Message removed. Click Save to apply.");
  };

  // ── Drag & drop reorder ───────────────────────────────
  const dragIndex = useRef<number | null>(null);

  const onDragStart = (i: number) => { dragIndex.current = i; };

  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === i) return;

    const next = [...config.messages];
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);

    setConfig((prev) => ({
      ...prev,
      messages: next.map((m, idx) => ({ ...m, sortOrder: idx })),
    }));
    dragIndex.current = i;
    setDirty(true);
  };

  const onDragEnd = () => { dragIndex.current = null; };

  // ── Save all ──────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      // Ensure sortOrder is sequential
      const orderedMessages = config.messages.map((m, i) => ({ ...m, sortOrder: i }));
      const payload = { ...config, messages: orderedMessages };

      const res = await fetch("/api/announcement-bar", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ config: payload }),
      });

      if (res.ok) {
        setConfig(payload);
        setDirty(false);
        toast.success("Announcement bar saved successfully!", "Saved");
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to save");
      }
    } catch {
      toast.error("Network error - could not save");
    }
    setSaving(false);
  };

  // ── Active message for preview ────────────────────────
  const activeMessages = config.messages.filter((m) => m.isActive);
  const previewMessage = activeMessages[previewIdx] ?? activeMessages[0];

  return (
    <div className="max-w-4xl space-y-5">

      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <Megaphone size={22} className="text-[#E10600]" />
            Announcement Bar
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Manage the rotating announcement bar at the top of your storefront.
          </p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={saving || !dirty}>
          {saving
            ? <><Loader size={14} className="animate-spin" />Saving...</>
            : <><Save size={14} />{dirty ? "Save Changes" : "Saved"}</>
          }
        </Button>
      </div>

      {/* ── Live preview ──────────────────────────────── */}
      <div className="bg-white border border-[#e5e7eb]">
        <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b7280]">Live Preview</p>
          {activeMessages.length > 1 && (
            <div className="flex items-center gap-1">
              {activeMessages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewIdx(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i === previewIdx ? "bg-[#E10600]" : "bg-[#e5e7eb] hover:bg-[#6b7280]"
                  )}
                  aria-label={`Preview message ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {config.enabled && activeMessages.length > 0 ? (
          <div
            className="w-full text-xs tracking-widest uppercase relative"
            style={{ backgroundColor: config.bgColor, color: config.textColor }}
          >
            <div className="h-9 flex items-center justify-center px-12">
              <p className="text-center leading-none font-medium tracking-[0.12em]">
                {previewMessage?.text || "(empty message)"}
              </p>
              {config.dismissible && (
                <button className="absolute right-4 opacity-60" style={{ color: config.textColor }}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center bg-[#fafaf9]">
            <p className="text-sm text-[#6b7280]">
              {!config.enabled
                ? "Announcement bar is currently disabled"
                : "No active messages to display"}
            </p>
          </div>
        )}
      </div>

      {/* ── Global settings ───────────────────────────── */}
      <div className="bg-white border border-[#e5e7eb] p-5 space-y-4">
        <h2 className="text-base font-bold text-[#1a1a1a] flex items-center gap-2">
          <Palette size={16} className="text-[#E10600]" />
          Settings
        </h2>

        {/* Enabled toggle */}
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
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a1a1a] flex items-center gap-1.5">
              {config.enabled
                ? <><Eye size={13} className="text-[#E10600]" />Enabled (visible on storefront)</>
                : <><EyeOff size={13} className="text-[#6b7280]" />Disabled (hidden from customers)</>
              }
            </p>
          </div>
        </label>

        {/* Dismissible toggle */}
        <label className="flex items-center gap-3 p-3 border border-[#e5e7eb] cursor-pointer hover:border-[#E10600] transition-colors">
          <input
            type="checkbox"
            checked={config.dismissible}
            onChange={(e) => updateConfig("dismissible", e.target.checked)}
            className="w-4 h-4 accent-[#E10600]"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a1a1a]">Allow customers to dismiss</p>
            <p className="text-xs text-[#6b7280] mt-0.5">Show an X button so visitors can close the bar</p>
          </div>
        </label>

        {/* Auto-rotate seconds */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2 flex items-center gap-1.5">
            <Clock size={12} />Rotation Speed (seconds)
          </label>
          <input
            type="number"
            min={1}
            max={60}
            value={config.autoRotateSeconds}
            onChange={(e) => updateConfig("autoRotateSeconds", Math.max(1, Number(e.target.value) || 5))}
            className="w-32 px-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none"
          />
          <p className="mt-1 text-[10px] text-[#6b7280]">
            How long each message stays visible before rotating. Only applies when there are 2+ active messages.
          </p>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ColorField
            label="Background"
            value={config.bgColor}
            onChange={(v) => updateConfig("bgColor", v)}
          />
          <ColorField
            label="Text Color"
            value={config.textColor}
            onChange={(v) => updateConfig("textColor", v)}
          />
          <ColorField
            label="Accent (Links)"
            value={config.accentColor}
            onChange={(v) => updateConfig("accentColor", v)}
          />
        </div>
      </div>

      {/* ── Info banner ───────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
        <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <p className="font-semibold mb-1">How it works</p>
          <p>
            Drag &amp; drop messages to change their order. Toggle <Eye size={11} className="inline" /> to enable/disable
            individual messages. Add an optional link URL to make the whole bar clickable when that message is showing.
            Messages auto-rotate every {config.autoRotateSeconds}s.
          </p>
        </div>
      </div>

      {/* ── Messages list ─────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1a1a1a]">
            Messages ({config.messages.length})
          </h2>
          <button
            onClick={addMessage}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E10600] hover:text-[#B80000]"
          >
            <Plus size={14} />Add Message
          </button>
        </div>

        {config.messages.length === 0 ? (
          <div className="bg-white border border-dashed border-[#e5e7eb] p-12 text-center">
            <Megaphone size={32} className="text-[#e5e7eb] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#1a1a1a] mb-1">No messages yet</p>
            <p className="text-xs text-[#6b7280] mb-4">Add your first announcement to get started.</p>
            <Button variant="primary" onClick={addMessage}>
              <Plus size={14} />Add First Message
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {config.messages.map((msg, i) => (
              <MessageRow
                key={msg.id}
                message={msg}
                index={i}
                onUpdate={(field, value) => updateMessage(msg.id, field, value)}
                onDelete={() => deleteMessage(msg.id)}
                onDragStart={() => onDragStart(i)}
                onDragOver={(e) => onDragOver(e, i)}
                onDragEnd={onDragEnd}
              />
            ))}
          </div>
        )}

        {config.messages.length > 0 && (
          <button
            onClick={addMessage}
            className="w-full py-3 border-2 border-dashed border-[#e5e7eb] hover:border-[#E10600] text-sm font-medium text-[#6b7280] hover:text-[#E10600] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />Add Another Message
          </button>
        )}
      </div>

      {/* ── Bottom save bar ───────────────────────────── */}
      {dirty && (
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 bg-white border-t border-[#e5e7eb] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-end gap-3">
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
//  COLOR FIELD
// ══════════════════════════════════════════════════════════
function ColorField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-[#1a1a1a] mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 border border-[#e5e7eb] cursor-pointer flex-shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-3 py-2 text-xs font-mono border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none uppercase"
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  MESSAGE ROW
// ══════════════════════════════════════════════════════════
interface MessageRowProps {
  message:     AnnouncementMessage;
  index:       number;
  onUpdate:    (field: keyof AnnouncementMessage, value: string | boolean | number) => void;
  onDelete:    () => void;
  onDragStart: () => void;
  onDragOver:  (e: React.DragEvent) => void;
  onDragEnd:   () => void;
}

function MessageRow({
  message, index, onUpdate, onDelete,
  onDragStart, onDragOver, onDragEnd,
}: MessageRowProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={cn(
        "bg-white border border-[#e5e7eb] p-4 transition-all",
        !message.isActive && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">

        {/* Drag handle + index */}
        <div className="flex flex-col items-center gap-1 pt-2 flex-shrink-0">
          <div className="cursor-grab active:cursor-grabbing text-[#6b7280] hover:text-[#E10600]">
            <GripVertical size={16} />
          </div>
          <span className="text-[10px] font-bold text-[#6b7280]">#{index + 1}</span>
        </div>

        {/* Fields */}
        <div className="flex-1 min-w-0 space-y-2">

          {/* Message text */}
          <input
            type="text"
            value={message.text}
            onChange={(e) => onUpdate("text", e.target.value)}
            placeholder="e.g. Free shipping on orders above PKR 5,000"
            className="w-full px-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none"
          />

          {/* Optional link */}
          <div className="flex items-center border border-[#e5e7eb] focus-within:border-[#E10600]">
            <span className="px-2 text-[#6b7280] flex-shrink-0">
              <LinkIcon size={12} />
            </span>
            <input
              type="text"
              value={message.link}
              onChange={(e) => onUpdate("link", e.target.value)}
              placeholder="Optional link URL (e.g. /shop or https://...)"
              className="flex-1 py-2 pr-3 text-xs bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onUpdate("isActive", !message.isActive)}
            className={cn(
              "p-2 transition-colors",
              message.isActive
                ? "text-[#E10600] hover:text-[#B80000]"
                : "text-[#6b7280] hover:text-[#1a1a1a]"
            )}
            title={message.isActive ? "Disable" : "Enable"}
          >
            {message.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-[#6b7280] hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}