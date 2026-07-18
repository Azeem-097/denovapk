import { useToastStore } from "@/store/toastStore";
import { renderTemplate } from "./messageTemplates";

/**
 * IMPORTANT: This file must remain CLIENT-SAFE.
 * Do NOT import anything that touches the DB or server-only code here.
 * Templates should be fetched via API by the caller, then passed in.
 */

export interface OrderConfirmationInput {
  orderNumber:   string;
  items:         Array<{ name: string; size?: string; color?: string; quantity: number; price: number }>;
  total:         number;
  paymentMethod: string;
  customer:      string;
  brandName?:    string;
  /**
   * Optional template override. If not provided, uses a fallback.
   * In production, fetch from /api/message-templates?key=template_order_confirmation
   * and pass the result here.
   */
  template?:     string;
}

export function openWhatsApp(phone: string | null | undefined, message: string): void {
  if (!phone || phone.trim() === "") {
    useToastStore.getState().warning("No phone number available for this contact.", "Cannot Open WhatsApp");
    return;
  }

  const digits = phone.replace(/\D/g, "");
  const formatted = digits.startsWith("92")
    ? digits
    : (digits.startsWith("0") ? "92" + digits.substring(1) : "92" + digits);

  const url = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

/**
 * Build an order confirmation WhatsApp message.
 * Synchronous. Uses `template` if given, else falls back to a hardcoded default.
 * For DB-driven templates, fetch via /api/message-templates first, then pass in.
 */
export function buildOrderConfirmationMessage(input: OrderConfirmationInput): string {
  const itemLines = input.items
    .map((i) => `- ${i.name}${i.color ? ` (${i.color})` : ""} x${i.quantity}`)
    .join("\n");

  // Fallback template if none provided
  const fallback =
    "Hi *{{name}}*!\n\n" +
    "Thank you for your order at *{{brandName}}*.\n\n" +
    "Order #: {{orderNumber}}\n" +
    "Items:\n{{items}}\n\n" +
    "Total: Rs. {{total}}\n" +
    "Payment: {{paymentMethod}}\n\n" +
    "We will confirm shipping details soon.";

  const template = input.template || fallback;

  return renderTemplate(template, {
    name:          input.customer,
    orderNumber:   input.orderNumber,
    items:         itemLines,
    total:         input.total.toLocaleString(),
    paymentMethod: input.paymentMethod,
    brandName:     input.brandName || "Denova PK",
  });
}

export function buildCustomerContactMessage(customerName: string): string {
  return (
    `Hi ${customerName}!\n\n` +
    `This is Denova PK. Thank you for being a valued customer!\n\n` +
    `How can we help you today?`
  );
}

/**
 * Fetch a message template from the API.
 * Call this from a React component/effect BEFORE sending a message.
 *
 * Example:
 *   const template = await fetchTemplate("template_order_confirmation");
 *   const msg = buildOrderConfirmationMessage({ ...data, template });
 */
export async function fetchTemplate(key: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/message-templates?key=${encodeURIComponent(key)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.value ?? null;
  } catch {
    return null;
  }
}