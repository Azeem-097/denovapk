"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import {
  ShoppingBag, Search, MessageCircle, Trash, User, Phone, Mail,
  Clock, MapPin, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDateTime, cn } from "@/lib/utils";
import { useToastStore } from "@/store/toastStore";
import { confirmAction } from "@/store/confirmStore";
import type { AbandonedCartWithParsedItems } from "@/lib/db/repositories/abandonedCart";

interface Stats {
  totalAbandoned:  number;
  guestCarts:      number;
  registeredCarts: number;
  recovered:       number;
  totalLostValue:  number;
}

interface Props {
  initialCarts:      AbandonedCartWithParsedItems[];
  initialStats:      Stats;
  waMessageTemplate: string;
}

type FilterType = "all" | "guest" | "registered" | "checkout" | "recovered";

export function AbandonedCartsClient({ initialCarts, initialStats, waMessageTemplate }: Props) {
  const [carts, setCarts] = useState(initialCarts);
  const [stats] = useState(initialStats);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const toast = useToastStore();

  const filtered = useMemo(() => {
    return carts.filter((c) => {
      if (filter === "guest"      && c.userId) return false;
      if (filter === "registered" && !c.userId) return false;
      if (filter === "checkout"   && c.reachedCheckout !== 1) return false;
      if (filter === "recovered"  && c.isRecovered   !== 1) return false;
      if (filter === "all"        && c.isRecovered   === 1) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (c.fullName ?? "").toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q) ||
          (c.phone ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [carts, search, filter]);

  const openWhatsApp = (cart: AbandonedCartWithParsedItems) => {
    if (!cart.phone) {
      toast.warning("This cart has no phone number to contact.", "No Phone Number");
      return;
    }

    const message = waMessageTemplate
      .replace(/\{\{name\}\}/g,   cart.fullName ?? "there")
      .replace(/\{\{amount\}\}/g, (cart.totalValue / 100).toFixed(0));

    const digits = cart.phone.replace(/\D/g, "");
    const phone  = digits.startsWith("92") ? digits : (digits.startsWith("0") ? "92" + digits.substring(1) : "92" + digits);

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    fetch(`/api/abandoned-carts/${cart.id}`, { method: "PATCH" }).then(() => {
      setCarts((prev) => prev.map((c) => c.id === cart.id ? { ...c, isContacted: 1 } : c));
    });
  };

  const deleteCart = async (cart: AbandonedCartWithParsedItems) => {
    const ok = await confirmAction({
      title:       "Delete Abandoned Cart",
      message:     `Remove this abandoned cart${cart.fullName ? ` from ${cart.fullName}` : ""}? You will lose the recovery opportunity.`,
      confirmText: "Delete",
      variant:     "danger",
    });
    if (!ok) return;

    const res = await fetch(`/api/abandoned-carts/${cart.id}`, { method: "DELETE" });
    if (res.ok) {
      setCarts((prev) => prev.filter((c) => c.id !== cart.id));
      toast.success("Abandoned cart removed.", "Deleted");
    } else {
      toast.error("Failed to delete cart.", "Delete Failed");
    }
  };

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
          <ShoppingBag size={22} className="text-[#3b5f8f]" />
          Abandoned Carts
        </h1>
        <p className="text-sm text-[#6b7280] mt-0.5">
          Recover lost sales by following up with customers who left their carts
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Active Carts"      value={stats.totalAbandoned.toString()} color="text-[#3b5f8f]" />
        <StatCard label="Guest Carts"       value={stats.guestCarts.toString()} />
        <StatCard label="Registered"        value={stats.registeredCarts.toString()} />
        <StatCard label="Total Lost Value"  value={formatPrice(stats.totalLostValue / 100)} color="text-orange-600" />
      </div>

      <div className="flex items-center gap-1 border-b border-[#e5e7eb] overflow-x-auto">
        {[
          { val: "all",        label: "All Active" },
          { val: "guest",      label: "Guests" },
          { val: "registered", label: "Registered" },
          { val: "checkout",   label: "Reached Checkout" },
          { val: "recovered",  label: "Recovered" },
        ].map((f) => (
          <button
            key={f.val} onClick={() => setFilter(f.val as FilterType)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap",
              filter === f.val
                ? "border-[#3b5f8f] text-[#3b5f8f]"
                : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#e5e7eb] p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#e5e7eb] p-12 text-center">
          <ShoppingBag size={40} className="text-[#3b5f8f] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#1a1a1a]">No abandoned carts</p>
          <p className="text-xs text-[#6b7280] mt-1">Great! Everyone is completing their orders.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cart) => (
            <AbandonedCartRow
              key={cart.id}
              cart={cart}
              onWhatsApp={() => openWhatsApp(cart)}
              onDelete={() => deleteCart(cart)}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-[#6b7280] text-center">Showing {filtered.length} of {carts.length} carts</p>
    </div>
  );
}

function StatCard({ label, value, color = "text-[#1a1a1a]" }: {
  label: string; value: string; color?: string;
}) {
  return (
    <div className="bg-white border border-[#e5e7eb] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] mb-1">{label}</p>
      <p className={cn("text-2xl font-bold", color)}>{value}</p>
    </div>
  );
}

function AbandonedCartRow({
  cart, onWhatsApp, onDelete,
}: {
  cart: AbandonedCartWithParsedItems;
  onWhatsApp: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white border border-[#e5e7eb] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#e5e7eb] bg-[#fafaf9] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {cart.userId ? (
            <Badge variant="info">Registered</Badge>
          ) : (
            <Badge variant="default">Guest</Badge>
          )}
          {cart.reachedCheckout === 1 && <Badge variant="warning">Reached Checkout</Badge>}
          {cart.isContacted   === 1 && <Badge variant="gold">Contacted</Badge>}
          {cart.isRecovered   === 1 && <Badge variant="success">Recovered</Badge>}

          <span className="text-xs text-[#6b7280] inline-flex items-center gap-1 ml-2">
            <Clock size={11} />
            {formatDateTime(new Date(cart.abandonedAt * 1000).toISOString())}
          </span>
        </div>

        <p className="text-lg font-bold text-[#3b5f8f]">
          {formatPrice(cart.totalValue / 100)}
        </p>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5">

          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="flex items-start gap-2 text-sm">
                <User size={13} className="text-[#3b5f8f] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#6b7280]">Name</p>
                  <p className="text-[#1a1a1a] font-medium">{cart.fullName ?? "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Phone size={13} className="text-[#3b5f8f] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#6b7280]">Phone</p>
                  <p className="text-[#1a1a1a] font-medium">{cart.phone ?? "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Mail size={13} className="text-[#3b5f8f] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#6b7280]">Email</p>
                  <p className="text-[#1a1a1a] font-medium truncate">{cart.email ?? "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={13} className="text-[#3b5f8f] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#6b7280]">City</p>
                  <p className="text-[#1a1a1a] font-medium">{cart.city ?? "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#e5e7eb] pt-3">
              <p className="text-[10px] uppercase tracking-wider text-[#6b7280] mb-2">
                {cart.itemCount} {cart.itemCount === 1 ? "Item" : "Items"} in Cart
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {cart.items.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#fafaf9] border border-[#e5e7eb] px-2 py-1.5">
                    <div className="relative w-8 h-10 bg-white flex-shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="32px" />}
                    </div>
                    <div className="text-xs">
                      <p className="text-[#1a1a1a] font-medium line-clamp-1 max-w-[120px]">{item.name}</p>
                      <p className="text-[10px] text-[#6b7280]">{item.size} - Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {cart.items.length > 4 && (
                  <span className="text-xs text-[#6b7280]">+{cart.items.length - 4} more</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:min-w-[180px]">
            <Button
              variant="primary" size="md" onClick={onWhatsApp}
              disabled={!cart.phone}
              className="!bg-green-600 hover:!bg-green-700"
            >
              <MessageCircle size={15} />
              Send WhatsApp
            </Button>
            {cart.isRecovered === 1 && (
              <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2">
                <CheckCircle size={13} />
                Order recovered!
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash size={13} />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}