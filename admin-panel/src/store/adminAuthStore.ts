"use client";
import { create } from "zustand";

export interface AdminUser {
  id:    string;
  name:  string;
  email: string;
  role:  string;
  avatar?: string | null;
}

interface AdminAuthState {
  admin:       AdminUser | null;
  isLoggedIn:  boolean;
  isLoading:   boolean;

  loadSession: () => Promise<void>;
  login:       (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout:      () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin:      null,
  isLoggedIn: false,
  isLoading:  true,

  loadSession: async () => {
    try {
      const res  = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.admin) {
        set({ admin: data.admin, isLoggedIn: true, isLoading: false });
      } else {
        set({ admin: null, isLoggedIn: false, isLoading: false });
      }
    } catch {
      set({ admin: null, isLoggedIn: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Login failed" };
      set({ admin: data.admin, isLoggedIn: true });
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  },

  logout: async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    set({ admin: null, isLoggedIn: false });
  },
}));

// For backwards compatibility with existing code
export const DEMO_ADMIN_CREDENTIALS = {
  email:    "admin@denovapk.com",
  password: "admin1234",
};