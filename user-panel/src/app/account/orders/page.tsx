"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, Search, ShoppingBag } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { AccountSidebar, NotLoggedInState } from "@/components/account/AccountSidebar";
import { useAuthStore } from "@/store/authStore";
import { formatPrice, formatDate, cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  confirmed:  "bg-blue-100 text-blue-700",
  processing: "bg-orange-100 text-orange-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
  refunded:   "bg-gray-100 text-gray-700",
};

const FILTERS = [
  { value: "all",        label: "All Orders" },
  { value: "processing", label: "Processing" },
  { value: "shipped",    label: "Shipped" },
  { value: "delivered",  label: "Delivered" },
];

interface OrderItem {
  id:       string;
  name:     string;
  image:    string;
  size:     string;
  color:    string;
  price:    number;
  quantity: number;
}

interface RealOrder {
  id:             string;
  orderNumber:    string;
  status:         string;
  paymentMethod:  string;
  total:          number;
  itemCount:      number;
  items:          OrderItem[];
  createdAt:      string;
  trackingNumber: string | null;
}

export default function OrdersPage() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<RealOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      fetch("/api/orders")
        .then((r) => r.ok ? r.json() : null)
        .then((d) => { if (d?.orders) setOrders(d.orders); })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesFilter = filter === "all" || o.status === filter;
      const matchesSearch = search.trim() === "" ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, search]);

  if (!mounted) return null;
  if (!isLoggedIn) return <NotLoggedInState />;

  return (
    <>
      <div className="pt-28 pb-8 sm:pt-32 sm:pb-10 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb items={[
              { label: "Home",    href: "/" },
              { label: "Account", href: "/account/dashboard" },
              { label: "Orders" }
            ]} className="mb-4" />
          </FadeIn>
          <TextReveal as="h1">
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a]">
              My Orders
            </span>
          </TextReveal>
          <FadeIn delay={100}>
            <p className="text-[#6b7280] text-sm mt-2">Track and manage all your orders</p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
          <FadeIn><AccountSidebar /></FadeIn>

          <div>
            {/* Toolbar */}
            <div className="bg-white border border-[#e5e7eb] p-4 mb-6 flex items-center justify-between gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                <input
                  type="text" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order number..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none placeholder:text-[#6b7280]/60"
                />
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                {FILTERS.map((f) => (
                  <button
                    key={f.value} onClick={() => setFilter(f.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium transition-colors",
                      filter === f.value
                        ? "bg-[#1a1a1a] text-white"
                        : "text-[#6b7280] hover:text-[#1a1a1a]"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders list */}
            {loading ? (
              <div className="bg-white border border-[#e5e7eb] p-10 text-center">
                <div className="w-8 h-8 border-2 border-[#3b5f8f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-[#6b7280]">Loading your orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white border border-[#e5e7eb] p-10 text-center">
                <ShoppingBag size={40} className="text-[#3b5f8f] mx-auto mb-4" />
                <h3 className="text-base font-semibold text-[#1a1a1a] mb-1">
                  {orders.length === 0 ? "No orders yet" : "No orders match your filter"}
                </h3>
                <p className="text-sm text-[#6b7280] mb-5">
                  {orders.length === 0
                    ? "Explore our collections and place your first order!"
                    : "Try a different search term or filter."}
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 text-sm font-semibold hover:bg-[#3b5f8f] transition-colors"
                >
                  {orders.length === 0 ? "Start Shopping" : "Browse Products"}
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order, i) => (
                  <FadeIn key={order.id} delay={i * 60}>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="block bg-white border border-[#e5e7eb] hover:border-[#3b5f8f] transition-colors"
                    >
                      <div className="px-5 py-3 border-b border-[#e5e7eb] bg-[#fafaf9] flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-[#6b7280]">Order</p>
                            <p className="text-sm font-semibold text-[#1a1a1a]">#{order.orderNumber}</p>
                          </div>
                          <div className="hidden sm:block h-8 w-px bg-[#e5e7eb]" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-[#6b7280]">Date</p>
                            <p className="text-sm text-[#1a1a1a]">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="hidden sm:block h-8 w-px bg-[#e5e7eb]" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-[#6b7280]">Total</p>
                            <p className="text-sm font-bold text-[#1a1a1a]">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="px-5 py-4 flex items-center gap-4 flex-wrap">
                        <div className="flex -space-x-3 flex-shrink-0">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="relative w-14 h-14 bg-[#fafaf9] border-2 border-white overflow-hidden">
                              {item.image && (
                                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="60px" />
                              )}
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-14 h-14 border-2 border-white bg-[#f5f0e8] flex items-center justify-center text-xs font-bold text-[#1a1a1a]">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#1a1a1a] line-clamp-1">
                            {order.items.map((i) => i.name).join(", ")}
                          </p>
                          <p className="text-xs text-[#6b7280] mt-1">
                            {order.itemCount} {order.itemCount === 1 ? "item" : "items"} · {order.paymentMethod}
                          </p>
                        </div>
                        <ArrowRight size={16} className="text-[#3b5f8f] flex-shrink-0" />
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            )}

            {!loading && orders.length > 0 && (
              <p className="text-xs text-[#6b7280] text-center mt-6">
                Showing {filteredOrders.length} of {orders.length} orders
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Silence unused Package import
void Package;