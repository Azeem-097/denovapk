"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Package, Truck, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { mockOrders } from "@/lib/data";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import type { Order } from "@/types";

const STATUS_STEPS = [
  { key: "confirmed",  label: "Confirmed",  icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped",    label: "Shipped",    icon: Truck },
  { key: "delivered",  label: "Delivered",  icon: CheckCircle },
];

export default function TrackOrderPage() {
  const [orderNum, setOrderNum] = useState("");
  const [email,    setEmail]    = useState("");
  const [result,   setResult]   = useState<Order | null>(null);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNum.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    await new Promise((r) => setTimeout(r, 800));

    const found = mockOrders.find(
      (o) => o.orderNumber.toLowerCase() === orderNum.trim().toLowerCase()
    );

    if (found) {
      setResult(found);
    } else {
      setError("No order found with that number. Please check and try again.");
    }

    setLoading(false);
  };

  return (
    <>
      <div className="pt-28 pb-10 sm:pt-32 sm:pb-14 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Track Order" }]}
              className="mb-4 justify-center"
            />
          </FadeIn>
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
              Order Status
            </span>
          </FadeIn>
          <TextReveal as="h1" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-2 block">
              Track Your Order
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <p className="text-[#6b7280] text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
              Enter your order number to check the current status and estimated delivery.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-8">

        {/* Search form */}
        <FadeIn>
          <form onSubmit={handleTrack} className="bg-white border border-[#e5e7eb] p-6 sm:p-8 space-y-4">
            <div>
              <label className="block text-xs font-medium tracking-wide text-[#1a1a1a] mb-1.5">
                Order Number <span className="text-[#c9a96e]">*</span>
              </label>
              <input
                type="text"
                value={orderNum}
                onChange={(e) => setOrderNum(e.target.value)}
                placeholder="e.g. DNV12345678"
                required
                className="w-full px-4 py-3 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none placeholder:text-[#6b7280]/60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium tracking-wide text-[#1a1a1a] mb-1.5">
                Email Address (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none placeholder:text-[#6b7280]/60"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderNum.trim()}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white py-3.5 text-sm font-semibold tracking-wide hover:bg-[#c9a96e] transition-colors disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Track Order
                </>
              )}
            </button>

            <p className="text-[11px] text-[#6b7280] text-center">
              Demo: try order number <span className="text-[#c9a96e] font-semibold">DNV12345678</span>
            </p>
          </form>
        </FadeIn>

        {/* Error */}
        {error && (
          <FadeIn>
            <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-600 text-center">
              {error}
            </div>
          </FadeIn>
        )}

        {/* Result */}
        {result && (
          <FadeIn>
            <div className="space-y-5">

              {/* Order header */}
              <div className="bg-white border border-[#e5e7eb] p-5">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                  <div>
                    <p className="text-xs text-[#6b7280] uppercase tracking-wider">Order</p>
                    <p className="text-lg font-bold text-[#1a1a1a]">#{result.orderNumber}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider",
                    result.status === "delivered"  ? "bg-green-100 text-green-700" :
                    result.status === "shipped"    ? "bg-indigo-100 text-indigo-700" :
                    result.status === "processing" ? "bg-orange-100 text-orange-700" :
                    "bg-blue-100 text-blue-700"
                  )}>
                    {result.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-[#6b7280]">
                  <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(result.createdAt)}</span>
                  <span>{result.items.length} {result.items.length === 1 ? "item" : "items"}</span>
                  <span className="font-semibold text-[#1a1a1a]">{formatPrice(result.total)}</span>
                </div>
              </div>

              {/* Status tracker */}
              {result.status !== "cancelled" && (
                <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
                  <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-6">
                    Delivery Progress
                  </h3>
                  <div className="relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#e5e7eb] mx-4">
                      <div
                        className="h-full bg-[#c9a96e] transition-all duration-700"
                        style={{
                          width: `${(STATUS_STEPS.findIndex((s) => s.key === result.status) / (STATUS_STEPS.length - 1)) * 100}%`
                        }}
                      />
                    </div>
                    <div className="relative flex justify-between">
                      {STATUS_STEPS.map((step, i) => {
                        const currentIdx = STATUS_STEPS.findIndex((s) => s.key === result.status);
                        const isDone   = i < currentIdx;
                        const isActive = i === currentIdx;
                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                              isDone   ? "bg-[#c9a96e] text-white" :
                              isActive ? "bg-[#1a1a1a] text-white ring-4 ring-[#1a1a1a]/10" :
                              "bg-white border-2 border-[#e5e7eb] text-[#6b7280]"
                            )}>
                              <step.icon size={13} />
                            </div>
                            <span className={cn(
                              "mt-2 text-[10px] sm:text-xs font-medium text-center",
                              (isDone || isActive) ? "text-[#1a1a1a]" : "text-[#6b7280]"
                            )}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping address */}
              <div className="bg-white border border-[#e5e7eb] p-5">
                <p className="text-xs font-semibold tracking-wider uppercase text-[#c9a96e] mb-2">
                  Shipping To
                </p>
                <p className="text-sm font-medium text-[#1a1a1a]">{result.address.fullName}</p>
                <p className="text-sm text-[#6b7280] mt-1 leading-relaxed">
                  {result.address.street}, {result.address.city}, {result.address.postalCode}
                </p>
                <p className="text-sm text-[#6b7280] mt-1">{result.address.phone}</p>
              </div>

              {/* View full order */}
              <Link
                href={`/account/orders/${result.id}`}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#c9a96e] hover:text-[#b8955a] transition-colors"
              >
                View Full Order Details
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>

            </div>
          </FadeIn>
        )}

        {/* Help */}
        <FadeIn>
          <div className="text-center py-6 border-t border-[#e5e7eb]">
            <p className="text-sm text-[#6b7280] mb-3">
              Can not find your order?
            </p>
            <Link
              href="/contact"
              className="text-sm font-semibold text-[#c9a96e] hover:underline"
            >
              Contact our support team
            </Link>
          </div>
        </FadeIn>

      </div>
    </>
  );
}