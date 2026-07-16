"use client";
import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id:        string;
  message:   string;
  title?:    string;
  type:      ToastType;
  duration?: number;
}

interface ToastState {
  toasts:      Toast[];
  addToast:    (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;

  // Shortcuts
  success:     (message: string, title?: string) => void;
  error:       (message: string, title?: string) => void;
  info:        (message: string, title?: string) => void;
  warning:     (message: string, title?: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 4000 };
    set({ toasts: [...get().toasts, newToast] });

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => get().removeToast(id), newToast.duration);
    }
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  success: (message, title) => get().addToast({ type: "success", message, title }),
  error:   (message, title) => get().addToast({ type: "error",   message, title }),
  info:    (message, title) => get().addToast({ type: "info",    message, title }),
  warning: (message, title) => get().addToast({ type: "warning", message, title }),
}));