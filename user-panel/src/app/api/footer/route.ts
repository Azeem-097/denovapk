import { NextResponse } from "next/server";
import { getSettingsByCategory, getSetting } from "@/lib/db/repositories/settings";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const [footer, contact, social] = await Promise.all([
      getSettingsByCategory("footer"),
      getSettingsByCategory("contact"),
      getSettingsByCategory("social"),
    ]);

    // Parse JSON link columns safely
    const parseLinks = (json: string): Array<{ label: string; href: string }> => {
      try { return JSON.parse(json); }
      catch { return []; }
    };

    const brandName = await getSetting("brand_name") ?? "Denova PK";

    return NextResponse.json({
      brand: {
        name:        brandName,
        description: footer.footer_brand_description ?? "",
        copyright:   footer.footer_copyright ?? "Denova PK. All rights reserved.",
        payment:     footer.footer_payment_methods ?? "JazzCash | EasyPaisa | COD | Bank Transfer",
      },
      contact: {
        phone:    contact.contact_phone_primary ?? "",
        email:    contact.contact_email ?? "",
        whatsapp: contact.contact_whatsapp ?? "",
        address:  await getSetting("brand_address") ?? "",
      },
      social: {
        instagram: social.social_instagram ?? "",
        facebook:  social.social_facebook ?? "",
        tiktok:    social.social_tiktok ?? "",
      },
      columns: [
        {
          title: footer.footer_col1_title ?? "Shop",
          links: parseLinks(footer.footer_col1_links ?? "[]"),
        },
        {
          title: footer.footer_col2_title ?? "Collections",
          links: parseLinks(footer.footer_col2_links ?? "[]"),
        },
        {
          title: footer.footer_col3_title ?? "Help",
          links: parseLinks(footer.footer_col3_links ?? "[]"),
        },
        {
          title: footer.footer_col4_title ?? "Company",
          links: parseLinks(footer.footer_col4_links ?? "[]"),
        },
      ],
      bottomLinks: parseLinks(footer.footer_bottom_links ?? "[]"),
    });
  } catch (err) {
    console.error("Footer API error:", err);
    return NextResponse.json({ error: "Failed to load footer" }, { status: 500 });
  }
}