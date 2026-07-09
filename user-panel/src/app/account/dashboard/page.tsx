"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, MapPin, Heart, ShoppingBag, ArrowRight, Clock, TrendingUp } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { SlideUp } from "@/components/animations/SlideUp";
import { AccountSidebar, NotLoggedInState } from "@/components/account/AccountSidebar";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { mockOrders } from "@/lib/data";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  confirmed:  "bg-blue-100 text-blue-700",
  processing: "bg-orange-100 text-orange-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
  refunded:   "bg-gray-100 text-gray-700",
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoggedIn, addresses } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.items.length);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (!isLoggedIn) return <NotLoggedInState />;

  const recentOrders = mockOrders.slice(0, 3);
  const totalSpent   = mockOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <>
      {/* Header */}
      <div className="pt-28 pb-8 sm:pt-32 sm:pb-10 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Account" }]}
              className="mb-4"
            />
          </FadeIn>
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
              My Account
            </span>
          </FadeIn>
          <TextReveal as="h1" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-2 block">
              Welcome back, {user?.name?.split(" ")[0] || "Friend"}!
            </span>
          </TextReveal>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">

          {/* Sidebar */}
          <FadeIn><AccountSidebar /></FadeIn>

          {/* Main */}
          <div className="space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <SlideUp stagger={80} index={0}>
                <StatCard icon={Package}     label="Total Orders" value={mockOrders.length.toString()} />
              </SlideUp>
              <SlideUp stagger={80} index={1}>
                <StatCard icon={TrendingUp}  label="Total Spent"  value={formatPrice(totalSpent)} />
              </SlideUp>
              <SlideUp stagger={80} index={2}>
                <StatCard icon={Heart}       label="Wishlist"     value={wishlistCount.toString()} />
              </SlideUp>
              <SlideUp stagger={80} index={3}>
                <StatCard icon={MapPin}      label="Addresses"    value={addresses.length.toString()} />
              </SlideUp>
            </div>

            {/* Recent orders */}
            <FadeIn delay={200}>
              <div className="bg-white border border-[#e5e7eb]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
                  <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
                    Recent Orders
                  </h2>
                  <Link
                    href="/account/orders"
                    className="text-xs text-[#c9a96e] hover:underline inline-flex items-center gap-1"
                  >
                    View all
                    <ArrowRight size={12} />
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="p-8 text-center">
                    <Package size={32} className="text-[#c9a96e] mx-auto mb-3" />
                    <p className="text-sm text-[#6b7280]">No orders yet</p>
                    <Link href="/shop" className="mt-3 inline-block text-xs text-[#c9a96e] underline">
                      Start shopping
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[#e5e7eb]">
                    {recentOrders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/account/orders/${order.id}`}
                        className="block px-5 py-4 hover:bg-[#fafaf9] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-[#1a1a1a]">
                                #{order.orderNumber}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${STATUS_COLORS[order.status]}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-[#6b7280]">
                              <span className="inline-flex items-center gap-1">
                                <Clock size={11} />
                                {formatDate(order.createdAt)}
                              </span>
                              <span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[#1a1a1a]">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Quick actions */}
            <FadeIn delay={300}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                <QuickAction
                  href="/shop"
                  icon={ShoppingBag}
                  title="Continue Shopping"
                  desc="Explore new arrivals"
                />
                <QuickAction
                  href="/wishlist"
                  icon={Heart}
                  title="My Wishlist"
                  desc={`${wishlistCount} saved items`}
                />
                <QuickAction
                  href="/account/settings"
                  icon={Package}
                  title="Account Settings"
                  desc="Manage your profile"
                />
              </div>
            </FadeIn>

          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({
  icon: Icon, label, value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-[#e5e7eb] p-4 lg:p-5">
      <div className="w-9 h-9 rounded-full bg-[#f5f0e8] flex items-center justify-center mb-3">
        <Icon size={16} className="text-[#c9a96e]" />
      </div>
      <p className="text-xs text-[#6b7280] mb-1">{label}</p>
      <p className="text-lg lg:text-xl font-bold text-[#1a1a1a]">{value}</p>
    </div>
  );
}

function QuickAction({
  href, icon: Icon, title, desc,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 bg-white border border-[#e5e7eb] p-4 hover:border-[#c9a96e] transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-[#f5f0e8] flex items-center justify-center flex-shrink-0 group-hover:bg-[#c9a96e] transition-colors">
        <Icon size={16} className="text-[#c9a96e] group-hover:text-white transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1a1a1a]">{title}</p>
        <p className="text-xs text-[#6b7280] mt-0.5">{desc}</p>
      </div>
      <ArrowRight size={14} className="text-[#6b7280] group-hover:text-[#c9a96e] group-hover:translate-x-1 transition-all" />
    </Link>
  );
}