"use client";
import { useEffect } from "react";
import Script from "next/script";
import { useAuthStore } from "@/store/authStore";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[][] };
    __DENOVA_META_PIXEL_ID?: string;
    __DENOVA_META_PIXEL_BOOTSTRAP?: boolean;
  }
}

export function MetaAdvancedMatchingProvider() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/settings/meta_pixel_enabled")
      .then((r) => r.ok ? r.json() : null)
      .then((enabledData) => {
        if (cancelled || enabledData?.value !== "true") return null;
        return fetch("/api/settings/meta_pixel_id");
      })
      .then((r) => r && r.ok ? r.json() : null)
      .then((idData) => {
        if (cancelled) return;
        const id = sanitizeMetaPixelId(idData?.value);
        if (!id || window.fbq) return;

        const fbq: NonNullable<Window["fbq"]> = (...args: unknown[]) => {
          (fbq.queue = fbq.queue ?? []).push(args);
        };
        fbq.queue = [];
        window.__DENOVA_META_PIXEL_ID = id;
        window.fbq = fbq;
        fbq("init", id);
        fbq("track", "PageView");

        const script = document.createElement("script");
        script.async = true;
        script.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(script);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user || !window.fbq || !window.__DENOVA_META_PIXEL_ID) return;

    const [firstName = "", ...lastNameParts] = (user.name ?? "").trim().split(/\s+/).filter(Boolean);

    buildMetaAdvancedMatching({
      email: user.email,
      phone: user.phone,
      firstName,
      lastName: lastNameParts.join(" "),
    })
      .then((data) => {
        if (Object.keys(data).length > 0 && window.fbq && window.__DENOVA_META_PIXEL_ID) {
          window.fbq("init", window.__DENOVA_META_PIXEL_ID, data);
        }
      })
      .catch(() => {});
  }, [user]);

  return (
    <Script id="meta-pixel-bootstrap" strategy="afterInteractive">
      {`window.__DENOVA_META_PIXEL_BOOTSTRAP = true;`}
    </Script>
  );
}

function sanitizeMetaPixelId(value: unknown): string {
  return (typeof value === "string" ? value : "").replace(/[^0-9]/g, "");
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashMetaText(value: string | undefined): Promise<string | undefined> {
  const normalized = (value ?? "").trim().toLowerCase();
  return normalized ? sha256(normalized) : undefined;
}

async function hashMetaPhone(value: string | undefined): Promise<string | undefined> {
  const normalized = (value ?? "").replace(/\D/g, "");
  return normalized ? sha256(normalized) : undefined;
}

async function buildMetaAdvancedMatching(input: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}): Promise<Record<string, string>> {
  const entries = await Promise.all([
    ["em", await hashMetaText(input.email)] as const,
    ["ph", await hashMetaPhone(input.phone)] as const,
    ["fn", await hashMetaText(input.firstName)] as const,
    ["ln", await hashMetaText(input.lastName)] as const,
  ]);

  return Object.fromEntries(entries.filter(([, value]) => !!value)) as Record<string, string>;
}
