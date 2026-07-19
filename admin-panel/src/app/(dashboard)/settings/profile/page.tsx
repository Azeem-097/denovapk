"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, User, Mail, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useToastStore } from "@/store/toastStore";
import { getInitials } from "@/lib/utils";

export default function ProfileSettingsPage() {
  const { admin, loadSession } = useAdminAuthStore();
  const toast = useToastStore();

  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile,  setSavingProfile]  = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (admin) {
      setName(admin.name);
      setEmail(admin.email);
    }
  }, [admin]);

  if (!admin) return null;

  // ─── Save name + email ─────────────────────────────
  const handleSaveProfile = async () => {
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters", "Invalid Name");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address", "Invalid Email");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update profile", "Update Failed");
        setSavingProfile(false);
        return;
      }
      toast.success("Profile updated successfully.", "Saved");
      await loadSession();
    } catch {
      toast.error("Network error. Please try again.", "Update Failed");
    }
    setSavingProfile(false);
  };

  // ─── Change password ───────────────────────────────
  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error("Enter your current password", "Missing Information");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters", "Weak Password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match", "Mismatch");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to change password", "Update Failed");
        setSavingPassword(false);
        return;
      }
      toast.success("Password changed successfully.", "Saved");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Network error. Please try again.", "Update Failed");
    }
    setSavingPassword(false);
  };

  return (
    <div className="max-w-3xl space-y-5">

      <div className="flex items-center gap-3">
        <Link href="/settings" className="p-2 hover:bg-white border border-[#e5e7eb] transition-colors">
          <ArrowLeft size={16} className="text-[#6b7280]" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Profile Settings</h1>
          <p className="text-xs text-[#6b7280] mt-0.5">Update your personal details and password</p>
        </div>
      </div>

      {/* Avatar + Role */}
      <div className="bg-white border border-[#e5e7eb] p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#3b5f8f] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl font-bold">{getInitials(admin.name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-[#1a1a1a]">{admin.name}</p>
          <p className="text-xs text-[#6b7280]">{admin.email}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Shield size={11} className="text-[#3b5f8f]" />
            <span className="text-[10px] px-2 py-0.5 bg-[#f5f0e8] text-[#3b5f8f] font-semibold uppercase tracking-wider">
              {admin.role.replace("_", " ").toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Personal Details ─────────────────────────── */}
      <Section title="Personal Details" icon={User}>
        <FormField label="Full Name" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="input"
          />
        </FormField>
        <FormField label="Email Address" required hint="Used to sign in to the admin panel">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@denovapk.com"
            className="input"
          />
        </FormField>
        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={handleSaveProfile} disabled={savingProfile}>
            <Save size={14} />
            {savingProfile ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </Section>

      {/* ─── Change Password ──────────────────────────── */}
      <Section title="Change Password" icon={Lock}>
        <FormField label="Current Password" required>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            className="input"
            autoComplete="current-password"
          />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="New Password" required hint="Minimum 8 characters">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="input"
              autoComplete="new-password"
            />
          </FormField>
          <FormField label="Confirm New Password" required>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="input"
              autoComplete="new-password"
            />
          </FormField>
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={handleChangePassword} disabled={savingPassword}>
            <Save size={14} />
            {savingPassword ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </Section>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          border: 1px solid #e5e7eb;
          background: white;
          outline: none;
          transition: border-color 0.15s;
        }
        :global(.input:focus) { border-color: #3b5f8f; }
      `}</style>
    </div>
  );
}

function Section({
  title, icon: Icon, children,
}: {
  title: string;
  icon:  React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#e5e7eb]">
      <div className="px-5 py-3 border-b border-[#e5e7eb] flex items-center gap-2">
        <Icon size={14} className="text-[#3b5f8f]" />
        <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function FormField({
  label, required, hint, children,
}: {
  label:    string;
  required?: boolean;
  hint?:    string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#1a1a1a] mb-1.5">
        {label}{required && <span className="text-[#3b5f8f] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-[#6b7280]">{hint}</p>}
    </div>
  );
}

// Silence unused
void Mail;