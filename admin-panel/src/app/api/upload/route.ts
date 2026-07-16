import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { processImage, processImageFromUrl, formatFileSize } from "@/lib/imageProcessor";
import type { ImageOptions } from "@/lib/imageProcessor";

/**
 * POST /api/upload
 *
 * Uploads images to Cloudinary CDN.
 *
 * Accepts either:
 *   - FormData with file (multipart upload)
 *   - JSON with { url, type } (Cloudinary downloads + optimizes external image)
 *
 * Returns optimized Cloudinary URL + stats.
 */
export async function POST(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let result;

    if (contentType.includes("multipart/form-data")) {
      // ── FILE UPLOAD ────────────────────────────────────
      const formData = await req.formData();
      const file     = formData.get("file") as File | null;
      const type     = (formData.get("type") as string) ?? "product";

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const allowedTypes = [
        "image/jpeg", "image/png", "image/webp",
        "image/avif", "image/gif", "image/bmp", "image/tiff",
      ];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({
          error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF, GIF, BMP, TIFF`,
        }, { status: 400 });
      }

      // Max 10 MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({
          error: "File too large. Maximum size is 10MB.",
        }, { status: 400 });
      }

      const buffer  = Buffer.from(await file.arrayBuffer());
      const options: ImageOptions = { type: type as ImageOptions["type"] };

      result = await processImage(buffer, options);

    } else if (contentType.includes("application/json")) {
      // ── URL-BASED UPLOAD ──────────────────────────────
      const { url, type } = await req.json();

      if (!url) {
        return NextResponse.json({ error: "No URL provided" }, { status: 400 });
      }

      const options: ImageOptions = { type: (type ?? "product") as ImageOptions["type"] };
      result = await processImageFromUrl(url, options);

    } else {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      image: {
        url:           result.url,
        filename:      result.filename,
        format:        result.format,
        width:         result.width,
        height:        result.height,
        originalSize:  formatFileSize(result.originalSize),
        optimizedSize: formatFileSize(result.optimizedSize),
        savings:       `${result.savings}%`,
      },
    });

  } catch (err) {
    console.error("Image upload error:", err);
    return NextResponse.json({
      error: "Failed to process image: " + (err as Error).message,
    }, { status: 500 });
  }
}