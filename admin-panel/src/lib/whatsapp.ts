import { useToastStore } from "@/store/toastStore";

export interface OrderConfirmationInput {
  orderNumber:   string;
  items:         Array<{ name: string; size?: string; color?: string; quantity: number; price: number }>;
  total:         number;
  paymentMethod: string;
  customer:      string;
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

export function buildOrderConfirmationMessage(input: OrderConfirmationInput): string {
  const itemLines = input.items
    .map((i) => `- ${i.name}${i.color ? ` (${i.color})` : ""} x${i.quantity}`)
    .join("\n");

  return (
    `Hi ${input.customer}!\n\n` +
    `Thank you for your order at Denova PK.\n\n` +
    `Order #: ${input.orderNumber}\n` +
    `Items:\n${itemLines}\n\n` +
    `Total: Rs. ${input.total.toLocaleString()}\n` +
    `Payment: ${input.paymentMethod}\n\n` +
    `We will confirm shipping details soon. Reach out here anytime for updates.`
  );
}

export function buildCustomerContactMessage(customerName: string): string {
  return (
    `Hi ${customerName}!\n\n` +
    `This is Denova PK. Thank you for being a valued customer!\n\n` +
    `How can we help you today?`
  );
}