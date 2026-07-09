"use client";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const loadSession    = useAuthStore((s) => s.loadSession);
  const isLoggedIn     = useAuthStore((s) => s.isLoggedIn);
  const isLoading      = useAuthStore((s) => s.isLoading);
  const setServerSync  = useCartStore((s) => s.setServerSync);
  const mergeToServer  = useCartStore((s) => s.mergeToServer);

  const wasLoggedIn = useRef<boolean | null>(null);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // React to login/logout changes
  useEffect(() => {
    if (isLoading) return;

    // On login: merge local cart to server + enable sync
    if (isLoggedIn && wasLoggedIn.current === false) {
      setServerSync(true);
      mergeToServer();
    }

    // On logout: disable sync (cart stays in localStorage)
    if (!isLoggedIn && wasLoggedIn.current === true) {
      setServerSync(false);
    }

    // Initial load — enable sync if already logged in
    if (isLoggedIn && wasLoggedIn.current === null) {
      setServerSync(true);
      // Load server cart
      useCartStore.getState().syncFromServer();
    }

    wasLoggedIn.current = isLoggedIn;
  }, [isLoading, isLoggedIn, setServerSync, mergeToServer]);

  return <>{children}</>;
}