"use client";
import { useEffect } from "react";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const loadSession = useAdminAuthStore((s) => s.loadSession);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return <>{children}</>;
}