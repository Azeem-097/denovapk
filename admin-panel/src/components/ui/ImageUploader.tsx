"use client";
import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Check, AlertCircle, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value:      string;
  onChange:   (url: string) => void;
  type?:      "product" | "banner" | "thumbnail" | "og";
  className?: string;
  aspectRatio?: string;
}

export function ImageUploader({
  value,
  onChange,
  type = "product",
  className,
  aspectRatio = "aspect-[3/4]",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const [stats, setStats]         = useState<{
    format: string; savings: string; optimizedSize: string;
  } | null>(null);
  const [dragOver, setDragOver]   = useState(false);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");
    setStats(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/upload", {
        method: "POST",
        body:   formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        setUploading(false);
        return;
      }

      onChange(data.image.url);
      setStats({
        format:        data.image.format,
        savings:       data.image.savings,
        optimizedSize: data.image.optimizedSize,
      });
    } catch {
      setError("Network error during upload");
    }

    setUploading(false);
  };

  const handleUrlPaste = async (url: string) => {
    if (!url.startsWith("http")) return;

    setError("");
    setStats(null);
    setUploading(true);

    try {
      const res = await fetch("/api/upload", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url, type }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to process image");
        onChange(url);
        setUploading(false);
        return;
      }

      onChange(data.image.url);
      setStats({
        format:        data.image.format,
        savings:       data.image.savings,
        optimizedSize: data.image.optimizedSize,
      });
    } catch {
      onChange(url);
      setError("Could not optimize, using original URL");
    }

    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  // ── Handler that stops the click from propagating up to a parent form ──
  // This is the KEY fix: buttons default to type="submit" inside a <form>,
  // which was triggering the form's onSubmit whenever "Replace" was clicked.
  const openFilePicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-3", className)}>

      {/* Preview or Upload Area */}
      {value ? (
        <div className="relative group">
          <div className={cn("relative bg-[#fafaf9] border border-[#e5e7eb] overflow-hidden", aspectRatio)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="w-full h-full object-cover" />

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={openFilePicker}
                className="bg-white text-[#1a1a1a] px-3 py-2 text-xs font-semibold hover:bg-[#3b5f8f] hover:text-white transition-colors"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange("");
                  setStats(null);
                }}
                className="bg-red-500 text-white px-3 py-2 text-xs font-semibold hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Optimization stats */}
          {stats && (
            <div className="flex items-center gap-2 mt-2 text-[10px] text-green-700 bg-green-50 border border-green-200 px-2 py-1">
              <Check size={10} />
              <span>
                Converted to <span className="font-bold uppercase">{stats.format}</span> &middot; {stats.optimizedSize} &middot; {stats.savings} saved
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
            aspectRatio,
            dragOver
              ? "border-[#3b5f8f] bg-[#f5f0e8]/50"
              : "border-[#e5e7eb] bg-[#fafaf9] hover:border-[#3b5f8f]"
          )}
          onClick={openFilePicker}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader size={24} className="text-[#3b5f8f] animate-spin" />
              <span className="text-xs text-[#6b7280]">Optimizing image...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4">
              <Upload size={24} className="text-[#6b7280]" />
              <span className="text-xs font-semibold text-[#1a1a1a]">
                Drop image here or click to upload
              </span>
              <span className="text-[10px] text-[#6b7280]">
                PNG, JPG, WebP up to 10MB &middot; Auto-converts to AVIF
              </span>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/bmp,image/tiff"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {/* URL input (alternative to file upload) */}
      <div>
        <label className="block text-[10px] font-medium text-[#6b7280] mb-1">
          Or paste image URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={value.startsWith("/uploads") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => {
              const url = e.target.value.trim();
              if (url.startsWith("http") && !url.includes("/uploads/")) {
                handleUrlPaste(url);
              }
            }}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 px-3 py-2 text-xs border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none"
          />
        </div>
        <p className="mt-1 text-[9px] text-[#6b7280]">
          External URLs are auto-downloaded and converted to AVIF for best performance
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 text-[10px] text-red-600 bg-red-50 border border-red-200 px-2 py-1">
          <AlertCircle size={10} />
          {error}
        </div>
      )}
    </div>
  );
}