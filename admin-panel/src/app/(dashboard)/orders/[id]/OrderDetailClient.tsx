"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Printer, Send, MapPin, User, CreditCard, Package,
  Truck, Phone, Mail, Copy, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatDateTime, cn } from "@/lib/utils";
import { ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from "@/lib/constants";
import type { AdminOrder, OrderStatus } from "@/types";

const STATUS_OPTIONS: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export function OrderDetailClient({ order }: { order: AdminOrder }) {
  const router = useRouter();
  const [status,   setStatus]   = useState<OrderStatus>(order.status);
  const [tracking, setTracking] = useState(order.trackingNum || "");
  const [note,     setNote]     = useState("");
  const [saving,   setSaving]   = useState(false);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: status.toUpperCase(), trackingNumber: tracking }),
      });
      if (res.ok) {
        alert("Order updated!");
        router.refresh();
      } else {
        alert("Failed to update");
      }
    } catch {
      alert("Network error");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/orders" className="p-2 hover:bg-white border border-[#e5e7eb] transition-colors">
            <ArrowLeft size={16} className="text-[#6b7280]" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#1a1a1a]">Order #{order.orderNumber}</h1>
              <span className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide capitalize border", ORDER_STATUS_COLORS[order.status])}>
                {order.status}
              </span>
              <span className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide capitalize", PAYMENT_STATUS_COLORS[order.paymentStatus])}>
                {order.paymentStatus}
              </span>
            </div>
            <p className="text-xs text-[#6b7280] mt-1">Placed on {formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Printer size={13} />Print Invoice</Button>
          <Button variant="outline" size="sm"><Send size={13} />Email Customer</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <div className="space-y-5">
          <Section title="Fulfillment Status" icon={Package}>
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="px-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none bg-white capitalize font-medium">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
              <Button variant="primary" size="sm" onClick={handleUpdate} disabled={saving}>
                {saving ? "Saving..." : "Update Status"}
              </Button>
            </div>

            {(status === "shipped" || status === "delivered") && (
              <div className="border-t border-[#e5e7eb] pt-3 mt-3">
                <label className="block text-xs font-medium text-[#1a1a1a] mb-1.5">Tracking Number</label>
                <input type="text" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. TCS12345678"
                  className="w-full px-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none font-mono" />
              </div>
            )}
          </Section>

          <Section title={`Items (${order.items.length})`} icon={Package}>
            <div className="divide-y divide-[#e5e7eb] -my-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 py-3">
                  <div className="relative w-14 h-16 flex-shrink-0 bg-[#fafaf9]">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="60px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-[#6b7280] mt-0.5 font-mono">SKU: {item.sku}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#6b7280]">
                      <span>Size: <span className="text-[#1a1a1a] font-medium">{item.size}</span></span>
                      <span>Color: <span className="text-[#1a1a1a] font-medium">{item.color}</span></span>
                      <span>Qty: <span className="text-[#1a1a1a] font-medium">{item.quantity}</span></span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#1a1a1a]">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-[10px] text-[#6b7280]">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Order Summary" icon={CreditCard}>
            <div className="space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              {order.discount > 0 && <Row label="Discount" value={`- ${formatPrice(order.discount)}`} highlight="text-green-600" />}
              <Row label="Shipping" value={order.shipping === 0 ? "FREE" : formatPrice(order.shipping)} />
              <div className="pt-2 mt-2 border-t border-[#e5e7eb] flex items-baseline justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-[#1a1a1a]">Total</span>
                <span className="text-xl font-bold text-[#1a1a1a]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Customer" icon={User}>
            <p className="text-sm font-semibold text-[#1a1a1a]">{order.customer}</p>
            <div className="space-y-2 mt-3 text-sm">
              {order.customerEmail && (
                <a href={`mailto:${order.customerEmail}`} className="flex items-center gap-2 text-[#6b7280] hover:text-[#c9a96e]">
                  <Mail size={12} />{order.customerEmail}
                </a>
              )}
              {order.customerPhone && (
                <a href={`tel:${order.customerPhone}`} className="flex items-center gap-2 text-[#6b7280] hover:text-[#c9a96e]">
                  <Phone size={12} />{order.customerPhone}
                </a>
              )}
            </div>
          </Section>

          <Section title="Shipping Address" icon={MapPin}>
            <p className="text-sm font-medium text-[#1a1a1a]">{order.customer}</p>
            {order.address && (
              <p className="text-sm text-[#6b7280] mt-1 leading-relaxed">
                {order.address}<br />{order.city}, Pakistan
              </p>
            )}
          </Section>

          <Section title="Payment" icon={CreditCard}>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#6b7280]">Method</span>
                <span className="text-[#1a1a1a] font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6b7280]">Status</span>
                <span className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide capitalize", PAYMENT_STATUS_COLORS[order.paymentStatus])}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6b7280]">Amount</span>
                <span className="text-[#1a1a1a] font-bold">{formatPrice(order.total)}</span>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#e5e7eb]">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[#e5e7eb]">
        <Icon size={14} className="text-[#c9a96e]" />
        <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#6b7280]">{label}</span>
      <span className={cn("font-medium", highlight || "text-[#1a1a1a]")}>{value}</span>
    </div>
  );
}