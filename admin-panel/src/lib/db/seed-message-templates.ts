import "dotenv/config";
import { createClient } from "@libsql/client";
import { randomBytes } from "crypto";

const genId = () => "c" + randomBytes(12).toString("hex");
const now   = () => Math.floor(Date.now() / 1000);

/**
 * FORCES the message templates to the new points-based defaults.
 * Run this script to reset templates whenever you want fresh copies.
 */
async function run() {
  const url       = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("Missing TURSO_DATABASE_URL");
    process.exit(1);
  }

  const db = createClient({ url, authToken });
  const t = now();

  // ═══════════════════════════════════════════════════════════
  //  New point-based templates — scannable, professional,
  //  WhatsApp markdown ready.
  // ═══════════════════════════════════════════════════════════
  const templates = [
    {
      key: "template_order_confirmation",
      val:
`Hi *{{name}}*! 👋

Your order at *{{brandName}}* is confirmed. 🎉

━━━━━━━━━━━━━━
📦 *Order Details*
━━━━━━━━━━━━━━
• Order #: _{{orderNumber}}_
• Payment: {{paymentMethod}}
• Total: *Rs. {{total}}*

🛍️ *Your Items:*
{{items}}

━━━━━━━━━━━━━━

We'll notify you as soon as your order ships.

Questions? Just reply to this message. 💬`
    },
    {
      key: "template_abandoned_cart",
      val:
`Hi *{{name}}*! 👋

You left {{itemCount}} item(s) in your cart at *{{brandName}}*. 🛒

━━━━━━━━━━━━━━
💰 *Cart Total:* Rs. {{amount}}
━━━━━━━━━━━━━━

Complete your purchase in one click:
👉 {{cartLink}}

Need help? Just reply to this message. We're happy to assist! 💬`
    },
    {
      key: "template_promotional",
      val:
`Hi *{{name}}*! 🎉

Exclusive offer from *{{brandName}}* — just for you!

━━━━━━━━━━━━━━
🎁 *Your Reward*
━━━━━━━━━━━━━━
• Discount: *{{discount}} OFF*
• Promo Code: *{{code}}*
• Valid until: _{{expiryDate}}_

Shop now: https://denovapk.com/shop

_Reply STOP to unsubscribe from promotions._`
    }
  ];

  console.log(`Updating ${templates.length} templates...`);

  for (const item of templates) {
    // Check if row exists
    const existing = await db.execute({
      sql: "SELECT id FROM settings WHERE key = ? LIMIT 1",
      args: [item.key]
    });

    if (existing.rows.length > 0) {
      await db.execute({
        sql: "UPDATE settings SET value = ?, updatedAt = ? WHERE key = ?",
        args: [item.val, t, item.key]
      });
      console.log(`  [OVERWRITE] ${item.key}`);
    } else {
      await db.execute({
        sql: "INSERT INTO settings (id, key, value, category, updatedAt) VALUES (?, ?, ?, ?, ?)",
        args: [genId(), item.key, item.val, "templates", t]
      });
      console.log(`  [INSERT]    ${item.key}`);
    }
  }

  console.log("\nDone! Refresh the admin panel to see new templates.");
}

run().catch(console.error);