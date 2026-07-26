"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Package, Truck, CheckCircle, Clock, ArrowRight, XCircle, MapPin } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { formatDate, formatPrice, cn } from "@/lib/utils";

// ─── Types (from the /api/track-order response) ─────────
interface TrackedOrderItem {
  id:       string;
  name:     string;
  image:    string;
  size:     string;
  color:    string;
  price:    number;
  quantity: number;
}

interface TrackedOrder {
  id:             string;
  orderNumber:    string;
  status:         string;
  paymentStatus:  string;
  paymentMethod:  string;
  itemCount:      number;
  total:          number;
  createdAt:      string;
  confirmedAt:    string | null;
  shippedAt:      string | null;
  deliveredAt:    string | null;
  cancelledAt:    string | null;
  trackingNumber: string | null;
  courierName:    string | null;
  shippingMethod: string;
  shippingCity:   string;
  shippingName:   string;
  items:          TrackedOrderItem[];
  verified:       boolean;
}

const STATUS_STEPS = [
  { key: "confirmed",  label: "Confirmed",  icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped",    label: "Shipped",    icon: Truck },
  { key: "delivered",  label: "Delivered",  icon: CheckCircle },
];

// Map various status values to progress index
function getStatusIndex(status: string): number {
  const s = status.toLowerCase();
  if (s === "pending")     return 0;
  if (s === "confirmed")   return 0;
  if (s === "processing")  return 1;
  if (s === "shipped")     return 2;
  if (s === "delivered")   return 3;
  return -1;
}

export default function TrackOrderPage() {
  const [orderNum, setOrderNum] = useState("");
  const [email,    setEmail]    = useState("");
  const [result,   setResult]   = useState<TrackedOrder | null>(null);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNum.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const params = new URLSearchParams();
      params.set("number", orderNum.trim());
      if (email.trim()) params.set("email", email.trim());

      const res  = await fetch(`/api/track-order?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setResult(data.order);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    }

    setLoading(false);
  };

  const isCancelled = result?.status === "cancelled";
  const isRefunded  = result?.status === "refunded";
  const statusIdx   = result ? getStatusIndex(result.status) : -1;

  return (
    <>
      {/* ── Page header ─────────────────────────────── */}
      <div className="pt-10 pb-10 sm:pt-12 sm:pb-14 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Track Order" }]}
              className="mb-4 justify-center"
            />
          </FadeIn>
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#E10600]">
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
              Enter your order number to check the current status and delivery progress.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-8">

        {/* ── Search form ─────────────────────────────── */}
        <FadeIn>
          <form onSubmit={handleTrack} className="bg-white border border-[#e5e7eb] p-6 sm:p-8 space-y-4">
            <div>
              <label className="block text-xs font-medium tracking-wide text-[#1a1a1a] mb-1.5">
                Order Number <span className="text-[#E10600]">*</span>
              </label>
              <input
                type="text"
                value={orderNum}
                onChange={(e) => setOrderNum(e.target.value)}
                placeholder="e.g. DNV12345678"
                required
                className="w-full px-4 py-3 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none placeholder:text-[#6b7280]/60 font-mono"
              />
              <p className="text-[11px] text-[#6b7280] mt-1.5">
                You can include or omit the # symbol.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium tracking-wide text-[#1a1a1a] mb-1.5">
                Email Address (optional but recommended)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none placeholder:text-[#6b7280]/60"
              />
              <p className="text-[11px] text-[#6b7280] mt-1.5">
                Provide your email to see full order details including items.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !orderNum.trim()}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white py-3.5 text-sm font-semibold tracking-wide hover:bg-[#E10600] transition-colors disabled:opacity-60"
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
          </form>
        </FadeIn>

        {/* ── Error ───────────────────────────────────── */}
        {error && (
          <FadeIn>
            <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-600 text-center flex items-center justify-center gap-2">
              <XCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          </FadeIn>
        )}

        {/* ── Result ──────────────────────────────────── */}
        {result && (
          <FadeIn>
            <div className="space-y-5">

              {/* Order header */}
              <div className="bg-white border border-[#e5e7eb] p-5">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                  <div>
                    <p className="text-xs text-[#6b7280] uppercase tracking-wider">Order</p>
                    <p className="text-lg font-bold text-[#1a1a1a] font-mono">#{result.orderNumber}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider",
                    result.status === "delivered"  ? "bg-green-100 text-green-700"   :
                    result.status === "shipped"    ? "bg-indigo-100 text-indigo-700" :
                    result.status === "processing" ? "bg-orange-100 text-orange-700" :
                    result.status === "cancelled"  ? "bg-red-100 text-red-700"       :
                    result.status === "refunded"   ? "bg-gray-100 text-gray-700"     :
                    "bg-red-100 text-red-700"
                  )}>
                    {result.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-[#6b7280]">
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {formatDate(result.createdAt)}
                  </span>
                  <span>
                    {result.itemCount} {result.itemCount === 1 ? "item" : "items"}
                  </span>
                  <span className="font-semibold text-[#1a1a1a]">
                    {formatPrice(result.total)}
                  </span>
                </div>
              </div>

              {/* Status tracker (unless cancelled/refunded) */}
              {!isCancelled && !isRefunded && statusIdx >= 0 && (
                <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
                  <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-6">
                    Delivery Progress
                  </h3>
                  <div className="relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#e5e7eb] mx-4">
                      <div
                        className="h-full bg-[#E10600] transition-all duration-700"
                        style={{
                          width: `${(statusIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="relative flex justify-between">
                      {STATUS_STEPS.map((step, i) => {
                        const isDone   = i < statusIdx;
                        const isActive = i === statusIdx;
                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                              isDone   ? "bg-[#E10600] text-white" :
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

                  {/* Timeline details */}
                  {(result.confirmedAt || result.shippedAt || result.deliveredAt) && (
                    <div className="mt-6 pt-5 border-t border-[#e5e7eb] space-y-2 text-xs">
                      {result.confirmedAt && (
                        <TimelineRow label="Confirmed" date={result.confirmedAt} />
                      )}
                      {result.shippedAt && (
                        <TimelineRow label="Shipped" date={result.shippedAt} />
                      )}
                      {result.deliveredAt && (
                        <TimelineRow label="Delivered" date={result.deliveredAt} />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Cancelled notice */}
              {isCancelled && (
                <div className="bg-red-50 border border-red-200 p-5">
                  <div className="flex items-center gap-3">
                    <XCircle size={20} className="text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">This order was cancelled</p>
                      {result.cancelledAt && (
                        <p className="text-xs text-red-600 mt-0.5">
                          Cancelled on {formatDate(result.cancelledAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tracking number */}
              {result.trackingNumber && (
                <div className="bg-[#f5f0e8]/40 border border-[#E10600]/30 p-5">
                  <p className="text-xs font-semibold tracking-wider uppercase text-[#E10600] mb-2">
                    Courier Tracking
                  </p>
                  <p className="text-sm text-[#6b7280]">
                    {result.courierName ?? "Courier"} - Tracking Number
                  </p>
                  <p className="text-base font-mono font-bold text-[#1a1a1a] mt-1">
                    {result.trackingNumber}
                  </p>
                </div>
              )}

              {/* Shipping info */}
              <div className="bg-white border border-[#e5e7eb] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-[#E10600]" />
                  <p className="text-xs font-semibold tracking-wider uppercase text-[#1a1a1a]">
                    Shipping To
                  </p>
                </div>
                {result.shippingName && (
                  <p className="text-sm font-medium text-[#1a1a1a]">{result.shippingName}</p>
                )}
                {result.shippingCity && (
                  <p className="text-sm text-[#6b7280] mt-1">{result.shippingCity}</p>
                )}
                {!result.verified && (
                  <p className="text-[11px] text-[#6b7280] mt-3 italic">
                    Enter the email used at checkout to see full delivery details.
                  </p>
                )}
              </div>

              {/* Items (only if email verified) */}
              {result.verified && result.items.length > 0 && (
                <div className="bg-white border border-[#e5e7eb]">
                  <div className="px-5 py-4 border-b border-[#e5e7eb]">
                    <p className="text-xs font-semibold tracking-wider uppercase text-[#1a1a1a]">
                      Items ({result.items.length})
                    </p>
                  </div>
                  <div className="divide-y divide-[#e5e7eb]">
                    {result.items.map((item) => (
                      <div key={item.id} className="px-5 py-4 flex gap-4">
                        <div className="relative w-16 h-20 flex-shrink-0 bg-[#fafaf9]">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                              unoptimized={item.image.startsWith("/uploads")}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1a1a1a] line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-[#6b7280] mt-1">
                            {item.size && <>Size: <span className="text-[#1a1a1a]">{item.size}</span></>}
                            {item.size && item.color && " · "}
                            {item.color && <>Color: <span className="text-[#1a1a1a]">{item.color}</span></>}
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
              )}

              {/* View full order (only if verified) */}
              {result.verified && (
                <Link
                  href={`/account/orders/${result.id}`}
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-[#E10600] hover:text-[#B80000] transition-colors"
                >
                  View Full Order Details
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              )}

            </div>
          </FadeIn>
        )}

        {/* ── Help ───────────────────────────────────── */}
        <FadeIn>
          <div className="text-center py-6 border-t border-[#e5e7eb]">
            <p className="text-sm text-[#6b7280] mb-3">
              Can not find your order?
            </p>
            <Link
              href="/contact"
              className="text-sm font-semibold text-[#E10600] hover:underline"
            >
              Contact our support team
            </Link>
          </div>
        </FadeIn>

      </div>
    </>
  );
}

// ─── Timeline row ────────────────────────────────────────
function TimelineRow({ label, date }: { label: string; date: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#6b7280]">{label}</span>
      <span className="text-[#1a1a1a] font-medium">{formatDate(date)}</span>
    </div>
  );
}
