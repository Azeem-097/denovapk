"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, MapPin, Heart, Settings, LogOut, User, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";

const NAV = [
  { href: "/account/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/account/orders",    label: "Orders",     icon: Package },
  { href: "/account/rewards",   label: "My Rewards", icon: Award },
  { href: "/account/addresses", label: "Addresses",  icon: MapPin },
  { href: "/wishlist",          label: "Wishlist",   icon: Heart },
  { href: "/account/settings",  label: "Settings",   icon: Settings },
];

export function AccountSidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const user      = useAuthStore((s) => s.user);
  const logout    = useAuthStore((s) => s.logout);
  const showToast = useToastStore((s) => s.addToast);

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out?")) {
      logout();
      showToast({ type: "info", message: "You have been signed out." });
      router.push("/");
    }
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "U";

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start bg-white border border-[#e5e7eb]">
      <div className="p-5 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#f5f0e8] flex items-center justify-center flex-shrink-0">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-[#F97316]">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1a1a1a] truncate">{user?.name || "Guest"}</p>
            <p className="text-xs text-[#6b7280] truncate">{user?.email || ""}</p>
          </div>
        </div>
      </div>

      <nav className="p-2">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded",
                active ? "bg-[#f5f0e8] text-[#F97316] font-semibold" : "text-[#1a1a1a] hover:bg-[#fafaf9]"
              )}>
              <Icon size={16} className={active ? "text-[#F97316]" : "text-[#6b7280]"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-[#e5e7eb]">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded transition-colors">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export function NotLoggedInState() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-[#fafaf9]">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-24 h-24 mx-auto bg-white border border-[#e5e7eb] rounded-full flex items-center justify-center mb-6">
          <User size={36} className="text-[#F97316]" />
        </div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-3">
          Sign in to your account
        </h1>
        <p className="text-sm text-[#6b7280] mb-8 leading-relaxed">
          Access your orders, wishlist, addresses, and personalized experience.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/account/login" className="inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#F97316] transition-colors">
            Sign In
          </Link>
          <Link href="/account/register" className="inline-flex items-center justify-center border border-[#1a1a1a] text-[#1a1a1a] px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#1a1a1a] hover:text-white transition-colors">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}