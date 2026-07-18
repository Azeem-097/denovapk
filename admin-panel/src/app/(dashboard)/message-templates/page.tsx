import { getSettingsByCategory } from "@/lib/db/repositories/settings";
import { MessageTemplatesClient } from "./MessageTemplatesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MessageTemplatesPage() {
  const templates = await getSettingsByCategory("templates");
  
  // Ensure defaults exist if DB wasn't seeded yet
  const safeTemplates = {
    template_order_confirmation: templates.template_order_confirmation ?? "",
    template_abandoned_cart:     templates.template_abandoned_cart ?? "",
    template_promotional:        templates.template_promotional ?? "",
  };

  return <MessageTemplatesClient initialTemplates={safeTemplates} />;
}