"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, Truck, MapPin, CreditCard, Download, MessageCircle, CheckCircle } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { AccountSidebar, NotLoggedInState } from "@/components/account/AccountSidebar";
import { useAuthStore } from "@/store/authStore";
import { formatPrice, formatDate, cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface OrderItem {
  id:       string;
  name:     string;
  image:    string;
  size:     string;
  color:    string;
  price:    number;
  quantity: number;
}

interface OrderAddress {
  fullName?:   string;
  street?:     string;
  city?:       string;
  province?:   string;
  postalCode?: string;
  phone?:      string;
}

interface Order {
  id:            string;
  orderNumber:   string;
  status:        string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal:      number;
  discount:      number;
  shipping:      number;
  total:         number;
  items:         OrderItem[];
  createdAt:     string;
  trackingNumber: string | null;
  shippingMethod: string;
  address:       OrderAddress | null;
}

const STATUS_STEPS = [
  { key: "confirmed",  label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped",    label: "Shipped" },
  { key: "delivered",  label: "Delivered" },
];

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isLoggedIn) {
      fetch(`/api/orders/${id}`)
        .then(async (r) => {
          if (!r.ok) {
            const err = await r.json();
            throw new Error(err.error || "Failed to load order");
          }
          return r.json();
        })
        .then((d) => setOrder(d.order))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, isLoggedIn]);

  if (!mounted) return null;
  if (!isLoggedIn) return <NotLoggedInState />;

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#3b5f8f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#6b7280]">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-[#fafaf9]">
        <div className="max-w-md mx-auto px-4 text-center">
          <Package size={48} className="text-[#3b5f8f] mx-auto mb-4" />
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] mb-2">
            Order not found
          </h1>
          <p className="text-sm text-[#6b7280] mb-6">{error || "This order could not be loaded."}</p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 text-sm font-semibold hover:bg-[#3b5f8f] transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <>
      <div className="pt-28 pb-6 sm:pt-32 sm:pb-8 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb items={[
              { label: "Home",    href: "/" },
              { label: "Account", href: "/account/dashboard" },
              { label: "Orders",  href: "/account/orders" },
              { label: `#${order.orderNumber}` },
            ]} className="mb-4" />
          </FadeIn>

          <FadeIn>
            <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#3b5f8f] mb-2">
              <ArrowLeft size={13} />
              Back to orders
            </Link>
          </FadeIn>

          <div className="flex items-end justify-between flex-wrap gap-3">
            <FadeIn delay={100}>
              <div>
                <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-sm text-[#6b7280] mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={150}>
              <button className="inline-flex items-center gap-2 border border-[#1a1a1a] text-[#1a1a1a] px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-[#1a1a1a] hover:text-white transition-colors">
                <Download size={13} />
                Invoice
              </button>
            </FadeIn>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
          <FadeIn><AccountSidebar /></FadeIn>

          <div className="space-y-6">
            {/* Status tracker */}
            {order.status !== "cancelled" && order.status !== "refunded" && (
              <FadeIn>
                <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
                  <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-6">
                    Order Status
                  </h2>

                  <div className="relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#e5e7eb] mx-4">
                      <div className="h-full bg-[#3b5f8f] transition-all duration-700"
                        style={{ width: `${(Math.max(currentStepIndex, 0) / (STATUS_STEPS.length - 1)) * 100}%` }} />
                    </div>

                    <div className="relative flex items-start justify-between">
                      {STATUS_STEPS.map((step, i) => {
                        const isDone   = i < currentStepIndex;
                        const isActive = i === currentStepIndex;
                        return (
                          <div key={step.key} className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isDone   ? "bg-[#3b5f8f] text-white" :
                              isActive ? "bg-[#1a1a1a] text-white ring-4 ring-[#1a1a1a]/10" :
                              "bg-white border-2 border-[#e5e7eb] text-[#6b7280]"
                            }`}>
                              {isDone ? <CheckCircle size={14} /> : i + 1}
                            </div>
                            <span className={`mt-2 text-[10px] sm:text-xs tracking-wide font-medium text-center ${
                              (isDone || isActive) ? "text-[#1a1a1a]" : "text-[#6b7280]"
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Items */}
            <FadeIn delay={100}>
              <div className="bg-white border border-[#e5e7eb]">
                <div className="px-5 py-4 border-b border-[#e5e7eb]">
                  <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
                    Items ({order.items.length})
                  </h2>
                </div>
                <div className="divide-y divide-[#e5e7eb]">
                  {order.items.map((item) => (
                    <div key={item.id} className="px-5 py-4 flex gap-4">
                      <div className="relative w-20 h-24 flex-shrink-0 bg-[#fafaf9]">
                        {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1a1a1a]">{item.name}</p>
                        <p className="text-xs text-[#6b7280] mt-1">
                          Size: <span className="text-[#1a1a1a]">{item.size}</span> · Color: <span className="text-[#1a1a1a]">{item.color}</span>
                        </p>
                        <p className="text-xs text-[#6b7280] mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-[#1a1a1a]">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {order.address && (
                <FadeIn delay={200}>
                  <div className="bg-white border border-[#e5e7eb] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={14} className="text-[#3b5f8f]" />
                      <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">Shipping Address</h3>
                    </div>
                    <p className="text-sm font-medium text-[#1a1a1a]">{order.address.fullName ?? "-"}</p>
                    <p className="text-sm text-[#6b7280] mt-1 leading-relaxed">
                      {order.address.street}<br />
                      {order.address.city}, {order.address.province?.toUpperCase()} {order.address.postalCode}
                    </p>
                    {order.address.phone && <p className="text-sm text-[#6b7280] mt-2">{order.address.phone}</p>}
                  </div>
                </FadeIn>
              )}

              <FadeIn delay={250}>
                <div className="bg-white border border-[#e5e7eb] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard size={14} className="text-[#3b5f8f]" />
                    <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">Payment Method</h3>
                  </div>
                  <p className="text-sm font-medium text-[#1a1a1a]">{order.paymentMethod}</p>
                  <p className="text-xs text-[#6b7280] mt-1">
                    Status: <span className={cn(
                      "font-medium",
                      order.paymentStatus === "paid" ? "text-green-600" : "text-orange-600"
                    )}>{order.paymentStatus}</span>
                  </p>
                  {order.trackingNumber && (
                    <div className="mt-3 pt-3 border-t border-[#e5e7eb]">
                      <p className="text-xs text-[#6b7280]">Tracking #</p>
                      <p className="text-sm font-mono font-bold text-[#1a1a1a]">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={300}>
              <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
                <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <SumRow label="Subtotal" value={formatPrice(order.subtotal)} />
                  {order.discount > 0 && <SumRow label="Discount" value={`- ${formatPrice(order.discount)}`} />}
                  <SumRow label="Shipping" value={order.shipping === 0 ? "FREE" : formatPrice(order.shipping)} highlight={order.shipping === 0} />
                  <div className="pt-3 mt-3 border-t border-[#e5e7eb] flex items-baseline justify-between">
                    <span className="text-sm font-semibold tracking-wide uppercase text-[#1a1a1a]">Total</span>
                    <span className="text-xl font-bold text-[#1a1a1a]">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="bg-[#f5f0e8] border border-[#3b5f8f]/30 p-5 lg:p-6 flex items-start gap-4">
                <MessageCircle size={20} className="text-[#3b5f8f] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1a1a1a]">Need help with this order?</p>
                  <p className="text-xs text-[#6b7280] mt-1">Our support team is here to assist you 24/7.</p>
                </div>
                <Link href="/contact" className="text-xs font-semibold text-[#3b5f8f] hover:text-[#2d4a72] underline whitespace-nowrap">
                  Contact Us
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </>
  );
}

function SumRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#6b7280]">{label}</span>
      <span className={`font-medium ${highlight ? "text-[#3b5f8f]" : "text-[#1a1a1a]"}`}>{value}</span>
    </div>
  );
}

// Silence unused imports
void Truck;