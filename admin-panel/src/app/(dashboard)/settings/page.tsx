import { getAllSettings } from "@/lib/db/repositories/settings";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const settings = await getAllSettings();
  return <SettingsClient initialSettings={settings} />;
}