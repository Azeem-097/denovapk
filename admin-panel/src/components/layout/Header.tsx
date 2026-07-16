"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Bell, Search, ExternalLink } from "lucide-react";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
  title?:      string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const router = useRouter();
  const [showNotifs,  setShowNotifs]  = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { admin, logout } = useAdminAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#e5e7eb] flex-shrink-0">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="p-2 -ml-2 text-[#6b7280] hover:text-[#1a1a1a] lg:hidden" aria-label="Open menu">
            <Menu size={22} />
          </button>
          {title && <h1 className="text-lg font-bold text-[#1a1a1a] hidden sm:block">{title}</h1>}
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
            <input type="text" placeholder="Search orders, products, customers..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#f8f9fa] border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none placeholder:text-[#6b7280]/60" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#6b7280] hover:text-[#c9a96e] border border-[#e5e7eb] px-3 py-2 transition-colors">
            <ExternalLink size={13} />View Store
          </a>

          <button onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            className="relative p-2 text-[#6b7280] hover:text-[#1a1a1a] transition-colors">
            <Bell size={20} />
          </button>

          <div className="relative">
            <button onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }} className="flex items-center gap-2 p-1">
              <div className="w-8 h-8 rounded-full bg-[#c9a96e] flex items-center justify-center">
                <span className="text-white text-xs font-bold">{getInitials(admin?.name || "A")}</span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-[#1a1a1a]">{admin?.name?.split(" ")[0]}</span>
            </button>

            {showProfile && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#e5e7eb] shadow-lg z-50 py-1">
                  <div className="px-4 py-2.5 border-b border-[#e5e7eb]">
                    <p className="text-sm font-semibold text-[#1a1a1a]">{admin?.name}</p>
                    <p className="text-xs text-[#6b7280]">{admin?.email}</p>
                  </div>
                  <Link
                    href="/settings/profile"
                    onClick={() => setShowProfile(false)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-[#1a1a1a] hover:bg-[#fafaf9]"
                  >
                    Profile Settings
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}