"use client";
import { create } from "zustand";
import type { User, Address } from "@/types";

interface AuthState {
  user:         User | null;
  addresses:    Address[];
  isLoggedIn:   boolean;
  isLoading:    boolean;

  loadSession:  () => Promise<void>;
  login:        (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register:     (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout:       () => Promise<void>;
  loadAddresses:() => Promise<void>;
  addAddress:   (address: AddressInput) => Promise<{ success: boolean; error?: string }>;
  updateAddress:(id: string, updates: Partial<AddressInput>) => Promise<{ success: boolean; error?: string }>;
  removeAddress:(id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  updateUser:   (updates: Partial<User>) => void;
}

interface RegisterData {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  password:  string;
  birthday?: string;
}

interface AddressInput {
  label:      string;
  fullName:   string;
  phone:      string;
  street:     string;
  apartment?: string;
  city:       string;
  province:   string;
  postalCode: string;
  isDefault?: boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:       null,
  addresses:  [],
  isLoggedIn: false,
  isLoading:  true,

  loadSession: async () => {
    try {
      const res  = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        set({ user: data.user, isLoggedIn: true, isLoading: false });
        get().loadAddresses();
      } else {
        set({ user: null, isLoggedIn: false, isLoading: false });
      }
    } catch {
      set({ user: null, isLoggedIn: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Login failed" };
      set({ user: data.user, isLoggedIn: true });
      get().loadAddresses();
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  },

  register: async (registerData) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Registration failed" };
      set({ user: data.user, isLoggedIn: true });
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  },

  logout: async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    set({ user: null, isLoggedIn: false, addresses: [] });
  },

  loadAddresses: async () => {
    try {
      const res  = await fetch("/api/addresses");
      const data = await res.json();
      if (data.addresses) set({ addresses: data.addresses });
    } catch {}
  },

  addAddress: async (address) => {
    try {
      const res = await fetch("/api/addresses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      await get().loadAddresses();
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  },

  updateAddress: async (id, updates) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      await get().loadAddresses();
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  },

  removeAddress: async (id) => {
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    await get().loadAddresses();
  },

  setDefaultAddress: async (id) => {
    await fetch(`/api/addresses/${id}/default`, { method: "POST" });
    await get().loadAddresses();
  },

  updateUser: (updates) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, ...updates } });
  },
}));