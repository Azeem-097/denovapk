"use client";
import { ToastContainer } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function NotificationProvider() {
  return (
    <>
      <ToastContainer />
      <ConfirmDialog />
    </>
  );
}