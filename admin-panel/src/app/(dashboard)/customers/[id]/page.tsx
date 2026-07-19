import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, MapPin, ShoppingBag, TrendingUp,
  Calendar, Star, Ban, Send, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getCustomerById } from "@/lib/db/repositories/customers";
import { getUserOrders } from "@/lib/db/repositories/orders";
import { adaptCustomer, adaptOrder } from "@/lib/adapters";
import { formatPrice, formatDate, getInitials, cn } from "@/lib/utils";
import { ORDER_STATUS_COLORS } from "@/lib/constants";
import { CustomerWhatsAppButton } from "./CustomerWhatsAppButton";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const dbCustomer = await getCustomerById(id);
  if (!dbCustomer) notFound();

  const customer = adaptCustomer(dbCustomer);
  const dbOrders = await getUserOrders(id);
  const orders   = dbOrders.map((o) => adaptOrder(o, customer.name, customer.email, customer.phone));

  const isVIP    = customer.totalSpent > 100000;
  const avgOrder = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/customers" className="p-2 hover:bg-white border border-[#e5e7eb] transition-colors">
            <ArrowLeft size={16} className="text-[#6b7280]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#1a1a1a]">{customer.name}</h1>
              {isVIP && <Badge variant="gold">VIP Customer</Badge>}
              <span className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide",
                customer.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                {customer.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-[#6b7280] mt-0.5">Customer since {formatDate(customer.joinedAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CustomerWhatsAppButton name={customer.name} phone={customer.phone} />
          <Button variant="outline" size="sm"><Send size={13} />Send Email</Button>
          <Button variant="ghost" size="sm"><Ban size={13} />Disable</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        <div className="space-y-5">
          <div className="bg-white border border-[#e5e7eb] p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#f5f0e8] flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-[#3b5f8f]">{getInitials(customer.name)}</span>
            </div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">{customer.name}</h2>

            <div className="mt-5 pt-5 border-t border-[#e5e7eb] space-y-3 text-left">
              <ContactRow icon={Mail}  label={customer.email} href={`mailto:${customer.email}`} />
              {customer.phone && <ContactRow icon={Phone} label={customer.phone} href={`tel:${customer.phone}`} />}
              {customer.city  && <ContactRow icon={MapPin} label={customer.city} />}
            </div>
          </div>

          {isVIP && (
            <div className="bg-[#f5f0e8] border border-[#3b5f8f]/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star size={14} className="text-[#3b5f8f]" fill="currentColor" />
                <p className="text-xs font-bold text-[#3b5f8f] uppercase tracking-wider">VIP Status</p>
              </div>
              <p className="text-xs text-[#1a1a1a] leading-relaxed">
                This customer has spent over PKR 100,000.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <StatBox icon={ShoppingBag} label="Total Orders" value={customer.totalOrders.toString()} />
            <StatBox icon={TrendingUp}  label="Total Spent"  value={formatPrice(customer.totalSpent)} color="text-[#3b5f8f]" />
            <StatBox icon={Calendar}    label="Avg Order"    value={formatPrice(avgOrder)} />
          </div>

          <div className="bg-white border border-[#e5e7eb]">
            <div className="px-5 py-3 border-b border-[#e5e7eb]">
              <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
                Order History ({orders.length})
              </h2>
            </div>
            {orders.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6b7280]">No orders yet.</div>
            ) : (
              <div className="divide-y divide-[#e5e7eb]">
                {orders.map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`} className="block px-5 py-4 hover:bg-[#fafaf9] transition-colors">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[#3b5f8f]">#{order.orderNumber}</span>
                          <span className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide border capitalize", ORDER_STATUS_COLORS[order.status])}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#6b7280] mt-1">
                          {order.items.length} items · {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-[#1a1a1a]">{formatPrice(order.total)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, label, href }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-2 text-xs">
      <Icon size={12} className="text-[#3b5f8f] flex-shrink-0" />
      <span className="text-[#1a1a1a] truncate">{label}</span>
    </div>
  );
  return href ? <a href={href} className="hover:text-[#3b5f8f]">{content}</a> : content;
}

function StatBox({ icon: Icon, label, value, color = "text-[#1a1a1a]" }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-white border border-[#e5e7eb] p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={13} className="text-[#3b5f8f]" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">{label}</p>
      </div>
      <p className={cn("text-lg font-bold", color)}>{value}</p>
    </div>
  );
}