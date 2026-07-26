"use client";
import { useEffect, useState } from "react";
import { Award, TrendingUp, Gift, ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { AccountSidebar, NotLoggedInState } from "@/components/account/AccountSidebar";
import { useAuthStore } from "@/store/authStore";
import { formatPrice, formatDate, cn } from "@/lib/utils";

interface LoyaltyTx {
  id:          string;
  type:        "EARNED" | "REDEEMED" | "EXPIRED" | "ADJUSTED";
  points:      number;
  balance:     number;
  description: string | null;
  createdAt:   number;
}

interface LoyaltyData {
  enabled:  boolean;
  points:   number;
  history:  LoyaltyTx[];
  settings: {
    pointValue:        number;
    minRedemption:     number;
    maxRedemptionPct:  number;
    programName:       string;
    earningRate:       number;
  };
}

export default function RewardsPage() {
  const [mounted,     setMounted]     = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [data,        setData]        = useState<LoyaltyData | null>(null);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetch("/api/loyalty")
        .then((r) => r.ok ? r.json() : null)
        .then((d) => setData(d))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  if (!mounted) return null;
  if (!isLoggedIn) return <NotLoggedInState />;

  return (
    <>
      <div className="pt-28 pb-8 sm:pt-32 sm:pb-10 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb items={[
              { label: "Home", href: "/" },
              { label: "Account", href: "/account/dashboard" },
              { label: "Rewards" },
            ]} className="mb-4" />
          </FadeIn>
          <TextReveal as="h1">
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a]">
              My Rewards
            </span>
          </TextReveal>
          <FadeIn delay={100}>
            <p className="text-[#6b7280] text-sm mt-2">
              Earn points on every order and redeem for discounts
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
          <FadeIn><AccountSidebar /></FadeIn>

          <div className="space-y-6">
            {loading ? (
              <div className="bg-white border border-[#e5e7eb] p-12 text-center">
                <div className="w-8 h-8 border-2 border-[#E10600] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-[#6b7280] mt-3">Loading rewards...</p>
              </div>
            ) : !data || !data.enabled ? (
              <div className="bg-[#f5f0e8] border border-[#E10600]/30 p-8 text-center">
                <Gift size={40} className="text-[#E10600] mx-auto mb-3" />
                <p className="text-lg font-bold text-[#1a1a1a]">Rewards Program Not Available</p>
                <p className="text-sm text-[#6b7280] mt-2">
                  The loyalty program is currently disabled. Check back soon!
                </p>
              </div>
            ) : (
              <>
                {/* Balance Card */}
                <FadeIn>
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#333333] text-white p-6 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10">
                      <Award size={200} />
                    </div>
                    <div className="relative">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#E10600] mb-2">
                        {data.settings.programName}
                      </p>
                      <p className="text-5xl sm:text-6xl font-bold text-white mb-1">
                        {data.points}
                      </p>
                      <p className="text-sm text-white/70 uppercase tracking-wider">Points</p>
                      <p className="text-lg text-[#E10600] font-semibold mt-3">
                        Worth {formatPrice(data.points * data.settings.pointValue)}
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Info cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InfoCard
                    icon={TrendingUp}
                    label="Earning Rate"
                    value={`${data.settings.earningRate}%`}
                    subtitle="Of order value"
                  />
                  <InfoCard
                    icon={Gift}
                    label="Min Redemption"
                    value={`${data.settings.minRedemption} pts`}
                    subtitle="To use points"
                  />
                  <InfoCard
                    icon={Award}
                    label="Max Per Order"
                    value={`${data.settings.maxRedemptionPct}%`}
                    subtitle="Of order total"
                  />
                </div>

                {/* How it works */}
                <FadeIn delay={200}>
                  <div className="bg-white border border-[#e5e7eb] p-5 lg:p-6">
                    <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-4">
                      How It Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <StepCard
                        num="1"
                        title="Shop"
                        desc={`Earn ${data.settings.earningRate}% of every order in points`}
                      />
                      <StepCard
                        num="2"
                        title="Save"
                        desc={`Accumulate at least ${data.settings.minRedemption} points`}
                      />
                      <StepCard
                        num="3"
                        title="Redeem"
                        desc={`Use points to save up to ${data.settings.maxRedemptionPct}% on future orders`}
                      />
                    </div>
                  </div>
                </FadeIn>

                {/* Transaction history */}
                <FadeIn delay={300}>
                  <div className="bg-white border border-[#e5e7eb]">
                    <div className="px-5 py-4 border-b border-[#e5e7eb]">
                      <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
                        Transaction History
                      </h2>
                    </div>
                    {data.history.length === 0 ? (
                      <div className="p-10 text-center">
                        <Award size={32} className="text-[#E10600] mx-auto mb-3" />
                        <p className="text-sm text-[#6b7280]">No transactions yet</p>
                        <p className="text-xs text-[#6b7280] mt-1">Complete your first order to start earning!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#e5e7eb]">
                        {data.history.map((tx) => (
                          <TxRow key={tx.id} tx={tx} pointValue={data.settings.pointValue} />
                        ))}
                      </div>
                    )}
                  </div>
                </FadeIn>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function InfoCard({ icon: Icon, label, value, subtitle }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: string; subtitle: string;
}) {
  return (
    <div className="bg-white border border-[#e5e7eb] p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} className="text-[#E10600]" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">{label}</p>
      </div>
      <p className="text-2xl font-bold text-[#1a1a1a]">{value}</p>
      <p className="text-[11px] text-[#6b7280] mt-1">{subtitle}</p>
    </div>
  );
}

function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-[#E10600] text-white flex items-center justify-center flex-shrink-0 font-bold">
        {num}
      </div>
      <div>
        <p className="text-sm font-bold text-[#1a1a1a]">{title}</p>
        <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function TxRow({ tx, pointValue }: { tx: LoyaltyTx; pointValue: number }) {
  const isEarn = tx.type === "EARNED";

  return (
    <div className="px-5 py-4 flex items-center gap-4">
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
        isEarn ? "bg-green-100" : "bg-red-100"
      )}>
        {isEarn ? (
          <ArrowDownLeft size={15} className="text-green-600" />
        ) : (
          <ArrowUpRight size={15} className="text-red-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1a1a1a] capitalize">
          {tx.type.toLowerCase()}
        </p>
        <p className="text-xs text-[#6b7280] mt-0.5 truncate">
          {tx.description ?? "-"}
        </p>
      </div>

      <div className="text-right">
        <p className={cn("text-sm font-bold", isEarn ? "text-green-600" : "text-red-500")}>
          {isEarn ? "+" : ""}{tx.points} pts
        </p>
        <p className="text-[10px] text-[#6b7280] mt-0.5 inline-flex items-center gap-1">
          <Calendar size={10} />
          {formatDate(new Date(tx.createdAt * 1000).toISOString())}
        </p>
      </div>
    </div>
  );
}