"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Truck, MapPin, CreditCard, Download, MessageCircle, CheckCircle } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { AccountSidebar, NotLoggedInState } from "@/components/account/AccountSidebar";
import { useAuthStore } from "@/store/authStore";
import { mockOrders } from "@/lib/data";
import { formatPrice, formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
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
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  if (!isLoggedIn) return <NotLoggedInState />;

  const order = mockOrders.find((o) => o.id === id);
  if (!order) notFound();

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <>
      <div className="pt-28 pb-6 sm:pt-32 sm:pb-8 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb
              items={[
                { label: "Home",    href: "/" },
                { label: "Account", href: "/account/dashboard" },
                { label: "Orders",  href: "/account/orders" },
                { label: `#${order.orderNumber}` },
              ]}
              className="mb-4"
            />
          </FadeIn>

          <FadeIn>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#c9a96e] mb-2"
            >
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
                    {/* Progress line */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#e5e7eb] mx-4">
                      <div
                        className="h-full bg-[#c9a96e] transition-all duration-700"
                        style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                      />
                    </div>

                    {/* Steps */}
                    <div className="relative flex items-start justify-between">
                      {STATUS_STEPS.map((step, i) => {
                        const isDone   = i < currentStepIndex;
                        const isActive = i === currentStepIndex;
                        return (
                          <div key={step.key} className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isDone   ? "bg-[#c9a96e] text-white" :
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
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1a1a1a]">{item.name}</p>
                        <p className="text-xs text-[#6b7280] mt-1">
                          Size: <span className="text-[#1a1a1a]">{item.size}</span> · Color: <span className="text-[#1a1a1a]">{item.color}</span>
                        </p>
                        <p className="text-xs text-[#6b7280] mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-[#1a1a1a]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Summary + Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Shipping */}
              <FadeIn delay={200}>
                <div className="bg-white border border-[#e5e7eb] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={14} className="text-[#c9a96e]" />
                    <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
                      Shipping Address
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-[#1a1a1a]">{order.address.fullName}</p>
                  <p className="text-sm text-[#6b7280] mt-1 leading-relaxed">
                    {order.address.street}<br />
                    {order.address.city}, {order.address.province} {order.address.postalCode}
                  </p>
                  <p className="text-sm text-[#6b7280] mt-2">{order.address.phone}</p>
                </div>
              </FadeIn>

              {/* Payment */}
              <FadeIn delay={250}>
                <div className="bg-white border border-[#e5e7eb] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard size={14} className="text-[#c9a96e]" />
                    <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
                      Payment Method
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-[#1a1a1a]">{order.paymentMethod}</p>
                  <p className="text-xs text-[#6b7280] mt-1">
                    Status: <span className="text-green-600 font-medium">Paid</span>
                  </p>
                </div>
              </FadeIn>
            </div>

            {/* Totals */}
            <FadeIn delay={300}>
              <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
                <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-4">
                  Order Summary
                </h2>
                <div className="space-y-2 text-sm">
                  <SumRow label="Subtotal" value={formatPrice(order.subtotal)} />
                  {order.discount > 0 && (
                    <SumRow label="Discount" value={`- ${formatPrice(order.discount)}`} />
                  )}
                  <SumRow
                    label="Shipping"
                    value={order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}
                    highlight={order.shipping === 0}
                  />
                  <div className="pt-3 mt-3 border-t border-[#e5e7eb] flex items-baseline justify-between">
                    <span className="text-sm font-semibold tracking-wide uppercase text-[#1a1a1a]">Total</span>
                    <span className="text-xl font-bold text-[#1a1a1a]">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Support */}
            <FadeIn delay={400}>
              <div className="bg-[#f5f0e8] border border-[#c9a96e]/30 p-5 lg:p-6 flex items-start gap-4">
                <MessageCircle size={20} className="text-[#c9a96e] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1a1a1a]">Need help with this order?</p>
                  <p className="text-xs text-[#6b7280] mt-1">Our support team is here to assist you 24/7.</p>
                </div>
                <Link
                  href="/contact"
                  className="text-xs font-semibold text-[#c9a96e] hover:text-[#b8955a] underline whitespace-nowrap"
                >
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
      <span className={`font-medium ${highlight ? "text-[#c9a96e]" : "text-[#1a1a1a]"}`}>{value}</span>
    </div>
  );
}