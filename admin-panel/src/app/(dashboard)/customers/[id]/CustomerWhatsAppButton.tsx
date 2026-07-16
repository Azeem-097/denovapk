"use client";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { openWhatsApp, buildCustomerContactMessage } from "@/lib/whatsapp";

export function CustomerWhatsAppButton({ name, phone }: { name: string; phone: string }) {
  return (
    <Button
      variant="primary" size="sm"
      onClick={() => openWhatsApp(phone, buildCustomerContactMessage(name))}
      disabled={!phone}
      className="!bg-green-600 hover:!bg-green-700"
    >
      <MessageCircle size={13} />
      WhatsApp
    </Button>
  );
}