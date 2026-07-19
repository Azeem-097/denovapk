"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, FolderOpen, BarChart3,
  ShoppingCart, Users, Tag, Settings, LogOut, ChevronRight,
  Layers, Star, ShoppingBag, Cake, Award, LayoutTemplate, Megaphone,
  LayoutGrid, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { getInitials } from "@/lib/utils";

const NAV_SECTIONS = [
  { label: "Overview", items: [
    { href: "/",           label: "Dashboard",   icon: LayoutDashboard },
    { href: "/analytics",  label: "Analytics",   icon: BarChart3 },
  ]},
  { label: "Catalogue", items: [
    { href: "/products",    label: "Products",    icon: Package },
    { href: "/collections", label: "Collections", icon: FolderOpen },
    { href: "/inventory",   label: "Inventory",   icon: Layers },
  ]},
  { label: "Sales", items: [
    { href: "/orders",           label: "Orders",           icon: ShoppingCart },
    { href: "/abandoned-carts",  label: "Abandoned Carts",  icon: ShoppingBag },
    { href: "/customers",        label: "Customers",        icon: Users },
    { href: "/discounts",        label: "Discounts",        icon: Tag },
  ]},
  { label: "Marketing", items: [
    { href: "/message-templates", label: "Message Templates", icon: MessageSquare },
    { href: "/birthdays",         label: "Birthdays",       icon: Cake },
    { href: "/loyalty",           label: "Loyalty Program", icon: Award },
  ]},
  { label: "Storefront", items: [
    { href: "/hero-banners",      label: "Hero Banners",      icon: LayoutTemplate },
    { href: "/announcement-bar",  label: "Announcement Bar",  icon: Megaphone },
    { href: "/gallery",           label: "Gallery",           icon: LayoutGrid },
  ]},
  { label: "Store", items: [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/staff",    label: "Staff",    icon: Star },
  ]},
];

interface SidebarProps {
  isOpen:   boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { admin, logout } = useAdminAuthStore();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogout = async () => {
    if (confirm("Sign out of the admin panel?")) {
      await logout();
      router.replace("/login");
    }
  };

  return (
    <>
      {isOpen && onClose && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />
      )}

      <aside className={cn(
        "fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#111111] text-white flex flex-col transition-transform duration-300",
        "lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
          <Link href="/" className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-[0.08em] text-white">DENOVA</span>
            <span className="text-[9px] font-medium tracking-[0.35em] text-[#3b5f8f] uppercase">Admin Panel</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 no-scrollbar">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-5">
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 px-3 mb-1.5">
                {section.label}
              </p>
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg mb-0.5 transition-all duration-150",
                      active
                        ? "bg-[#3b5f8f] text-white"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon size={17} className="flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={13} className="opacity-60" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="flex-shrink-0 border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#3b5f8f] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">{getInitials(admin?.name || "A")}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{admin?.name || "Admin"}</p>
              <p className="text-[10px] text-white/50 truncate">
                {admin?.role?.replace("_", " ").toLowerCase()}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut size={14} />Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}