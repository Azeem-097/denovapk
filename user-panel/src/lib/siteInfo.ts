import { getBoolSetting, getStringSetting } from "@/lib/db/repositories/settings";

/**
 * Site-wide dynamic info sourced from admin settings.
 * Used by legal pages, contact page, and any other page
 * that needs brand contact information.
 *
 * All fields have sensible fallbacks so pages never break.
 */
export interface SiteInfo {
  email:              string;
  phone:              string;
  whatsapp:           string;
  address:            string;
  brandName:          string;
  brandTagline:       string;
  brandDescription:   string;
  brandCity:          string;
  brandYear:          string;
  legalLastUpdated:   string;
  businessHours:      Array<{ day: string; time: string }>;
  storeLocationEnabled: boolean;
  storeLatitude:      string;
  storeLongitude:     string;
  mapEmbedUrl:        string;
}

const DEFAULTS: SiteInfo = {
  email:            "",
  phone:            "",
  whatsapp:         "",
  address:          "",
  brandName:        "Denova PK",
  brandTagline:     "Crafted for the Modern You",
  brandDescription: "Premium Denim Clothing - Pakistan's finest selvedge jeans",
  brandCity:        "Lahore",
  brandYear:        "2026",
  legalLastUpdated: "July 2026",
  businessHours:    [],
  storeLocationEnabled: false,
  storeLatitude:    "",
  storeLongitude:   "",
  mapEmbedUrl:      "",
};

/**
 * Server-side: load all site info in a single call.
 * Use in server components (RSC / page.tsx).
 */
export async function getSiteInfo(): Promise<SiteInfo> {
  try {
    const [
      email,
      phone,
      whatsapp,
      address,
      brandName,
      brandTagline,
      brandDescription,
      brandCity,
      brandYear,
      legalLastUpdated,
      businessHoursRaw,
      storeLocationEnabled,
      storeLatitude,
      storeLongitude,
      mapEmbedUrl,
    ] = await Promise.all([
      getStringSetting("contact_email",          DEFAULTS.email),
      getStringSetting("contact_phone_primary",  DEFAULTS.phone),
      getStringSetting("contact_whatsapp",       DEFAULTS.whatsapp),
      getStringSetting("brand_address",          DEFAULTS.address),
      getStringSetting("brand_name",             DEFAULTS.brandName),
      getStringSetting("brand_tagline",          DEFAULTS.brandTagline),
      getStringSetting("brand_description",      DEFAULTS.brandDescription),
      getStringSetting("brand_city",             DEFAULTS.brandCity),
      getStringSetting("brand_year",             DEFAULTS.brandYear),
      getStringSetting("legal_last_updated",     DEFAULTS.legalLastUpdated),
      getStringSetting("business_hours",         "[]"),
      getBoolSetting("store_location_enabled",   false),
      getStringSetting("store_latitude",         ""),
      getStringSetting("store_longitude",        ""),
      getStringSetting("map_embed_url",          ""),
    ]);
    let businessHours: SiteInfo["businessHours"] = [];
    try {
      const parsed = JSON.parse(businessHoursRaw);
      if (Array.isArray(parsed)) {
        businessHours = parsed.filter((h) =>
          typeof h?.day === "string" && typeof h?.time === "string" && h.day.trim() && h.time.trim()
        );
      }
    } catch {
      businessHours = [];
    }

    return {
      email:            email          || DEFAULTS.email,
      phone:            phone          || DEFAULTS.phone,
      whatsapp:         whatsapp       || DEFAULTS.whatsapp,
      address:          address        || DEFAULTS.address,
      brandName:        brandName      || DEFAULTS.brandName,
      brandTagline:     brandTagline   || DEFAULTS.brandTagline,
      brandDescription: brandDescription || DEFAULTS.brandDescription,
      brandCity:        brandCity      || DEFAULTS.brandCity,
      brandYear:        brandYear      || DEFAULTS.brandYear,
      legalLastUpdated: legalLastUpdated || DEFAULTS.legalLastUpdated,
      businessHours,
      storeLocationEnabled,
      storeLatitude: storeLatitude || "",
      storeLongitude: storeLongitude || "",
      mapEmbedUrl: mapEmbedUrl || "",
    };
  } catch (err) {
    console.error("Failed to load site info:", err);
    throw err;
  }
}

/**
 * Helper: strip everything except digits + leading '+' from phone.
 * Useful for building tel:/wa.me: links.
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}
