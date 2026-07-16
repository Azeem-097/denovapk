"use client";
import { create } from "zustand";

export interface ConfirmOptions {
  title?:       string;
  message:      string;
  confirmText?: string;
  cancelText?:  string;
  variant?:     "danger" | "warning" | "info";
}

interface ConfirmState {
  isOpen:   boolean;
  options:  ConfirmOptions | null;
  resolver: ((value: boolean) => void) | null;

  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel:  () => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen:   false,
  options:  null,
  resolver: null,

  confirm: (options) => {
    return new Promise<boolean>((resolve) => {
      set({ isOpen: true, options, resolver: resolve });
    });
  },

  handleConfirm: () => {
    const { resolver } = get();
    if (resolver) resolver(true);
    set({ isOpen: false, options: null, resolver: null });
  },

  handleCancel: () => {
    const { resolver } = get();
    if (resolver) resolver(false);
    set({ isOpen: false, options: null, resolver: null });
  },
}));

// Convenience helper — call anywhere without importing the store
export async function confirmAction(options: ConfirmOptions): Promise<boolean> {
  return useConfirmStore.getState().confirm(options);
}