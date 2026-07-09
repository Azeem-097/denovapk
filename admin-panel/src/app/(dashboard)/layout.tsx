"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router     = useRouter();
  const isLoggedIn = useAdminAuthStore((s) => s.isLoggedIn);
  const isLoading  = useAdminAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs tracking-[0.2em] uppercase text-[#6b7280]">Loading Admin</p>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}