"use client";
import { useState, useRef } from "react";
import { Upload, X, Star, GripVertical, Loader, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  images:    string[];
  onChange:  (images: string[]) => void;
  maxImages?: number;
  type?:     "product" | "banner";
}

export function MultiImageUploader({
  images,
  onChange,
  maxImages = 8,
  type = "product",
}: Props) {
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState("");
  const [dragIndex, setDragIndex]   = useState<number | null>(null);
  const [urlInput, setUrlInput]     = useState("");
  const fileInputRef                = useRef<HTMLInputElement>(null);

  // ── Upload a single file ─────────────────────────────
  const uploadFile = async (file: File): Promise<string | null> => {
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
        return null;
      }

      return data.image.url;
    } catch {
      return null;
    }
  };

  // ── Handle file selection (multiple) ─────────────────
  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));

    if (images.length + fileArray.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed. You have ${images.length}, trying to add ${fileArray.length}.`);
      return;
    }

    setError("");
    setUploading(true);

    const newUrls: string[] = [];
    for (const file of fileArray) {
      const url = await uploadFile(file);
      if (url) newUrls.push(url);
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }

    setUploading(false);
  };

  // ── Handle URL paste ─────────────────────────────────
  const handleAddUrl = async () => {
    const url = urlInput.trim();
    if (!url.startsWith("http")) return;
    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed.`);
      return;
    }

    setError("");
    setUploading(true);

    try {
      const res = await fetch("/api/upload", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url, type }),
      });
      const data = await res.json();

      if (res.ok) {
        onChange([...images, data.image.url]);
        setUrlInput("");
      } else {
        // If optimization fails, still add the original URL
        onChange([...images, url]);
        setUrlInput("");
      }
    } catch {
      onChange([...images, url]);
      setUrlInput("");
    }

    setUploading(false);
  };

  // ── Remove image ─────────────────────────────────────
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  // ── Set as primary (move to index 0) ─────────────────
  const setPrimary = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [moved] = newImages.splice(index, 1);
    newImages.unshift(moved);
    onChange(newImages);
  };

  // ── Drag and drop reordering ─────────────────────────
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newImages = [...images];
    const [moved] = newImages.splice(dragIndex, 1);
    newImages.splice(index, 0, moved);
    onChange(newImages);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  // ── Handle drop on upload zone ───────────────────────
  const handleZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3">

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div
              key={`${img}-${i}`}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative group border-2 aspect-square bg-[#fafaf9] overflow-hidden cursor-move",
                i === 0 ? "border-[#c9a96e]" : "border-[#e5e7eb]",
                dragIndex === i && "opacity-50"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />

              {/* Primary badge */}
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-[#c9a96e] text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5">
                  Primary
                </span>
              )}

              {/* Drag handle */}
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={14} className="text-white drop-shadow-md" />
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                {i !== 0 && (
                  <button
                    onClick={() => setPrimary(i)}
                    className="bg-white text-[#1a1a1a] p-1.5 hover:bg-[#c9a96e] hover:text-white transition-colors"
                    title="Set as primary"
                  >
                    <Star size={12} />
                  </button>
                )}
                <button
                  onClick={() => removeImage(i)}
                  className="bg-white text-red-500 p-1.5 hover:bg-red-500 hover:text-white transition-colors"
                  title="Remove"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}

          {/* Add more button (in grid) */}
          {images.length < maxImages && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-[#e5e7eb] hover:border-[#c9a96e] flex flex-col items-center justify-center gap-1 transition-colors text-[#6b7280] hover:text-[#c9a96e]"
            >
              <Plus size={20} />
              <span className="text-[10px] font-medium">Add More</span>
            </button>
          )}
        </div>
      )}

      {/* Upload zone (shown when no images) */}
      {images.length === 0 && (
        <div
          className="border-2 border-dashed border-[#e5e7eb] hover:border-[#c9a96e] aspect-[3/2] flex flex-col items-center justify-center cursor-pointer transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleZoneDrop}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader size={24} className="text-[#c9a96e] animate-spin" />
              <span className="text-xs text-[#6b7280]">Uploading & optimizing...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4">
              <Upload size={28} className="text-[#6b7280]" />
              <span className="text-xs font-semibold text-[#1a1a1a]">
                Drop images here or click to upload
              </span>
              <span className="text-[10px] text-[#6b7280]">
                PNG, JPG, WebP · Up to {maxImages} images · Auto-converts to AVIF
              </span>
            </div>
          )}
        </div>
      )}

      {/* Uploading indicator */}
      {uploading && images.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-[#c9a96e]">
          <Loader size={12} className="animate-spin" />
          Uploading & optimizing...
        </div>
      )}

      {/* Hidden file input (multiple!) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* URL input */}
      <div>
        <label className="block text-[10px] font-medium text-[#6b7280] mb-1">
          Or paste image URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 px-3 py-2 text-xs border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none"
          />
          <button
            onClick={handleAddUrl}
            disabled={!urlInput.trim() || uploading}
            className="px-3 py-2 text-xs font-semibold bg-[#1a1a1a] text-white hover:bg-[#c9a96e] transition-colors disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>

      {/* Info */}
      <p className="text-[9px] text-[#6b7280]">
        First image is the primary (shown on product cards). Drag to reorder. Click ★ to set primary. {images.length}/{maxImages} images.
      </p>

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