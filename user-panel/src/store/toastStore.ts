"use client";
import { create } from "zustand";

export interface Toast {
  id:       string;
  message:  string;
  type:     "success" | "error" | "info";
  duration?: number;
}

interface ToastState {
  toasts:      Toast[];
  addToast:    (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 3000 };
    set({ toasts: [...get().toasts, newToast] });

    setTimeout(() => {
      get().removeToast(id);
    }, newToast.duration);
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));