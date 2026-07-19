"use client";
import { useState } from "react";
import Link from "next/link";
import { Cake, MessageCircle, Phone, Mail, Calendar, Gift, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getInitials, cn } from "@/lib/utils";
import { useToastStore } from "@/store/toastStore";

interface BirthdayUser {
  id:        string;
  name:      string;
  email:     string;
  phone:     string | null;
  birthday:  string;
  age:       number;
  daysUntil: number;
}

interface Props {
  today:    BirthdayUser[];
  upcoming: BirthdayUser[];
  settings: {
    enabled:       boolean;
    discountPct:   number;
    fixedAmount:   number;
    minOrder:      number;
    validityDays:  number;
    reminderDays:  number;
    waMessage:     string;
    freeGift:      string;
  };
}

export function BirthdaysClient({ today, upcoming, settings }: Props) {
  const [tab, setTab] = useState<"today" | "upcoming">("today");
  const toast = useToastStore();

  const list = tab === "today" ? today : upcoming;

  const openWhatsApp = (user: BirthdayUser) => {
    if (!user.phone) {
      toast.warning("This customer has no phone number.", "No Phone Number");
      return;
    }

    const discountText = settings.fixedAmount > 0
      ? `Rs. ${settings.fixedAmount}`
      : `${settings.discountPct}%`;

    let message = settings.waMessage
      .replace(/\{\{name\}\}/g,     user.name)
      .replace(/\{\{discount\}\}/g, discountText)
      .replace(/\{\{minOrder\}\}/g, settings.minOrder.toString())
      .replace(/\{\{days\}\}/g,     settings.validityDays.toString());

    if (!message.toLowerCase().includes("happy birthday")) {
      message = `Happy Birthday ${user.name}!\n\n${message}`;
    }

    const digits = user.phone.replace(/\D/g, "");
    const phone  = digits.startsWith("92") ? digits :
                    (digits.startsWith("0") ? "92" + digits.substring(1) : "92" + digits);

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-5">

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <Cake size={22} className="text-[#3b5f8f]" />
            Birthday Rewards
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Send birthday wishes and reward loyal customers on their special day
          </p>
        </div>
        <Link href="/settings">
          <Button variant="outline"><Settings size={14} />Program Settings</Button>
        </Link>
      </div>

      {!settings.enabled && (
        <div className="bg-orange-50 border border-orange-200 p-4">
          <p className="text-sm text-orange-800">
            <strong>Birthday rewards program is disabled.</strong> Enable it in{" "}
            <Link href="/settings" className="underline font-semibold">Settings</Link> to auto-apply birthday discounts.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Cake}     label="Birthdays Today"     value={today.length.toString()}    color="text-[#3b5f8f]" />
        <StatCard icon={Users}    label="Upcoming"           value={upcoming.length.toString()} />
        <StatCard icon={Gift}     label="Discount"           value={settings.fixedAmount > 0 ? `Rs. ${settings.fixedAmount}` : `${settings.discountPct}%`} />
        <StatCard icon={Calendar} label="Valid For"           value={`${settings.validityDays} days`} />
      </div>

      <div className="bg-[#f5f0e8]/50 border border-[#3b5f8f]/30 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#3b5f8f] mb-3">
          Current Program Rules
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <p className="text-[#6b7280]">Discount</p>
            <p className="text-sm font-bold text-[#1a1a1a]">
              {settings.fixedAmount > 0 ? `Rs. ${settings.fixedAmount}` : `${settings.discountPct}% off`}
            </p>
          </div>
          <div>
            <p className="text-[#6b7280]">Min. Order</p>
            <p className="text-sm font-bold text-[#1a1a1a]">Rs. {settings.minOrder.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[#6b7280]">Validity</p>
            <p className="text-sm font-bold text-[#1a1a1a]">{settings.validityDays} days after birthday</p>
          </div>
          <div>
            <p className="text-[#6b7280]">Reminder Range</p>
            <p className="text-sm font-bold text-[#1a1a1a]">{settings.reminderDays} days upcoming</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-[#e5e7eb]">
        <button
          onClick={() => setTab("today")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
            tab === "today" ? "border-[#3b5f8f] text-[#3b5f8f]" : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]"
          )}
        >
          Today
          <span className={cn(
            "ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full",
            tab === "today" ? "bg-[#3b5f8f]/20 text-[#3b5f8f]" : "bg-[#e5e7eb] text-[#6b7280]"
          )}>
            {today.length}
          </span>
        </button>
        <button
          onClick={() => setTab("upcoming")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
            tab === "upcoming" ? "border-[#3b5f8f] text-[#3b5f8f]" : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]"
          )}
        >
          Upcoming ({settings.reminderDays} days)
          <span className={cn(
            "ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full",
            tab === "upcoming" ? "bg-[#3b5f8f]/20 text-[#3b5f8f]" : "bg-[#e5e7eb] text-[#6b7280]"
          )}>
            {upcoming.length}
          </span>
        </button>
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-[#e5e7eb] p-12 text-center">
          <Cake size={40} className="text-[#3b5f8f] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#1a1a1a]">
            {tab === "today" ? "No birthdays today" : "No upcoming birthdays"}
          </p>
          <p className="text-xs text-[#6b7280] mt-1">
            {tab === "today"
              ? "Check the upcoming tab for future celebrations"
              : `No customer birthdays in the next ${settings.reminderDays} days`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((user) => (
            <BirthdayCard
              key={user.id}
              user={user}
              isToday={tab === "today"}
              onWhatsApp={() => openWhatsApp(user)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = "text-[#1a1a1a]" }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: string; color?: string;
}) {
  return (
    <div className="bg-white border border-[#e5e7eb] p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-[#3b5f8f]" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">{label}</p>
      </div>
      <p className={cn("text-2xl font-bold", color)}>{value}</p>
    </div>
  );
}

function BirthdayCard({ user, isToday, onWhatsApp }: {
  user: BirthdayUser;
  isToday: boolean;
  onWhatsApp: () => void;
}) {
  const dateStr = new Date(user.birthday).toLocaleDateString("en-US", {
    month: "long", day: "numeric",
  });

  return (
    <div className={cn(
      "border p-5",
      isToday
        ? "bg-gradient-to-br from-[#f5f0e8] to-[#f5f0e8]/50 border-[#3b5f8f]"
        : "bg-white border-[#e5e7eb]"
    )}>
      <div className="flex items-start gap-3 mb-4">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
          isToday ? "bg-[#3b5f8f] text-white" : "bg-[#f5f0e8] text-[#3b5f8f]"
        )}>
          <span className="text-sm font-bold">{getInitials(user.name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-[#1a1a1a] truncate">{user.name}</h3>
            {isToday && <Badge variant="gold">TODAY!</Badge>}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
            <Calendar size={11} />
            {dateStr} - Turning {user.age + (isToday ? 0 : 1)}
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mb-4 text-xs">
        <div className="flex items-center gap-2 text-[#6b7280]">
          <Mail size={11} className="text-[#3b5f8f]" />
          <span className="truncate">{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center gap-2 text-[#6b7280]">
            <Phone size={11} className="text-[#3b5f8f]" />
            <span>{user.phone}</span>
          </div>
        )}
      </div>

      {!isToday && user.daysUntil > 0 && (
        <div className="mb-3 text-center bg-white border border-[#e5e7eb] py-2">
          <p className="text-[10px] uppercase tracking-wider text-[#6b7280]">Coming In</p>
          <p className="text-lg font-bold text-[#3b5f8f]">
            {user.daysUntil} {user.daysUntil === 1 ? "Day" : "Days"}
          </p>
        </div>
      )}

      <Button
        variant="primary" size="md" onClick={onWhatsApp}
        disabled={!user.phone}
        className="w-full !bg-green-600 hover:!bg-green-700"
      >
        <MessageCircle size={14} />
        Send Birthday Wish
      </Button>
    </div>
  );
}