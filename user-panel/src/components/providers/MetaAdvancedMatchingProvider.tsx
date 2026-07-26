"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    __DENOVA_META_PIXEL_ID?: string;
  }
}

export function MetaAdvancedMatchingProvider() {
  const user = useAuthStore((s) => s.user);

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

  return null;
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
