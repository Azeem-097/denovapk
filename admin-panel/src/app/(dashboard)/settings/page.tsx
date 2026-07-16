import { getAllSettings, getSetting } from "@/lib/db/repositories/settings";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const settings = await getAllSettings();

  // Hydrate WhatsApp widget JSON into flat form fields
  const whatsappRaw = await getSetting("whatsapp_widget");
  if (whatsappRaw) {
    try {
      const parsed = JSON.parse(whatsappRaw);
      settings.whatsapp = {
        enabled:          String(parsed.enabled ?? true),
        phone:            parsed.phone ?? "",
        communityLink:    parsed.communityLink ?? "",
        greeting:         parsed.greeting ?? "Hi! I'm interested in Denova PK.",
        directLabel:      parsed.directLabel ?? "Direct Message",
        communityLabel:   parsed.communityLabel ?? "Join Community",
        directSubtext:    parsed.directSubtext ?? "Chat with our support team",
        communitySubtext: parsed.communitySubtext ?? "Join our WhatsApp community",
      };
    } catch {
      settings.whatsapp = {};
    }
  } else {
    settings.whatsapp = {};
  }

  return <SettingsClient initialSettings={settings} />;
}