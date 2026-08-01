import { NextResponse } from "next/server";
import { getSettingsByCategory, getSetting } from "@/lib/db/repositories/settings";

export const dynamic    = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [footer, contact, social, brandName, brandDescription, brandAddress] = await Promise.all([
      getSettingsByCategory("footer"),
      getSettingsByCategory("contact"),
      getSettingsByCategory("social"),
      getSetting("brand_name"),
      getSetting("brand_description"),
      getSetting("brand_address"),
    ]);

    // Parse JSON link columns safely
    const parseLinks = (json: string): Array<{ label: string; href: string }> => {
      try { return JSON.parse(json); }
      catch { return []; }
    };

    return NextResponse.json({
      brand: {
        name:        brandName ?? "Denova PK",
        description: brandDescription || footer.footer_brand_description || "",
        copyright:   footer.footer_copyright ?? "Denova PK. All rights reserved.",
        payment:     footer.footer_payment_methods ?? "JazzCash | EasyPaisa | COD | Bank Transfer",
      },
      contact: {
        phone:    contact.contact_phone_primary ?? "",
        email:    contact.contact_email ?? "",
        whatsapp: contact.contact_whatsapp ?? "",
        address:  brandAddress ?? "",
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
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Footer API error:", err);
    return NextResponse.json({ error: "Failed to load footer" }, { status: 500 });
  }
}
