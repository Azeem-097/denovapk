import { getStringSetting } from "@/lib/db/repositories/settings";

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
  brandYear:          string;
  legalLastUpdated:   string;
}

const DEFAULTS: SiteInfo = {
  email:            "hello@denovapk.com",
  phone:            "+92 300 123 4567",
  whatsapp:         "+923001234567",
  address:          "Gulberg III, Lahore, Pakistan",
  brandName:        "Denova PK",
  brandYear:        "2026",
  legalLastUpdated: "July 2026",
};

/**
 * Server-side: load all site info in a single call.
 * Use in server components (RSC / page.tsx).
 */
export async function getSiteInfo(): Promise<SiteInfo> {
  try {
    const [email, phone, whatsapp, address, brandName, brandYear, legalLastUpdated] = await Promise.all([
      getStringSetting("contact_email",          DEFAULTS.email),
      getStringSetting("contact_phone_primary",  DEFAULTS.phone),
      getStringSetting("contact_whatsapp",       DEFAULTS.whatsapp),
      getStringSetting("brand_address",          DEFAULTS.address),
      getStringSetting("brand_name",             DEFAULTS.brandName),
      getStringSetting("brand_year",             DEFAULTS.brandYear),
      getStringSetting("legal_last_updated",     DEFAULTS.legalLastUpdated),
    ]);

    return {
      email:            email          || DEFAULTS.email,
      phone:            phone          || DEFAULTS.phone,
      whatsapp:         whatsapp       || DEFAULTS.whatsapp,
      address:          address        || DEFAULTS.address,
      brandName:        brandName      || DEFAULTS.brandName,
      brandYear:        brandYear      || DEFAULTS.brandYear,
      legalLastUpdated: legalLastUpdated || DEFAULTS.legalLastUpdated,
    };
  } catch (err) {
    console.error("Failed to load site info, using defaults:", err);
    return DEFAULTS;
  }
}

/**
 * Helper: strip everything except digits + leading '+' from phone.
 * Useful for building tel:/wa.me: links.
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}