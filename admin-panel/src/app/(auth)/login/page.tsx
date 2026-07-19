"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, ArrowRight, Shield } from "lucide-react";
import { useAdminAuthStore, DEMO_ADMIN_CREDENTIALS } from "@/store/adminAuthStore";

export default function AdminLoginPage() {
  const router     = useRouter();
  const login      = useAdminAuthStore((s) => s.login);
  const isLoggedIn = useAdminAuthStore((s) => s.isLoggedIn);
  const isLoading  = useAdminAuthStore((s) => s.isLoading);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace("/");
    }
  }, [isLoading, isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      setTimeout(() => router.replace("/"), 100);
    } else {
      setError(result.error || "Login failed");
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_ADMIN_CREDENTIALS.email);
    setPassword(DEMO_ADMIN_CREDENTIALS.password);
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="inline-flex flex-col items-center leading-none mb-3">
            <span className="text-3xl font-bold tracking-[0.08em] text-white">DENOVA</span>
            <span className="text-[9px] font-medium tracking-[0.35em] text-[#3b5f8f] uppercase mt-0.5">Admin Panel</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Shield size={14} className="text-[#3b5f8f]" />
            <p className="text-sm text-white/50">Secure Admin Access</p>
          </div>
        </div>

        <div className="bg-white p-8">
          <div className="mb-6 p-3 bg-[#f5f0e8] border border-[#3b5f8f]/30">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold text-[#3b5f8f] uppercase tracking-wider">Demo Credentials</p>
                <p className="text-xs text-[#1a1a1a] mt-1">{DEMO_ADMIN_CREDENTIALS.email}</p>
                <p className="text-xs text-[#6b7280]">{DEMO_ADMIN_CREDENTIALS.password}</p>
              </div>
              <button type="button" onClick={fillDemo} className="text-xs font-bold text-[#3b5f8f] hover:text-[#2d4a72] underline flex-shrink-0">
                Fill
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#1a1a1a] mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@denovapk.com"
                className="w-full px-4 py-3 text-sm border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none placeholder:text-[#6b7280]/60" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a1a1a] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password"
                  className="w-full px-4 py-3 text-sm border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none placeholder:text-[#6b7280]/60 pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white py-3.5 text-sm font-semibold tracking-wide hover:bg-[#3b5f8f] transition-colors disabled:opacity-60 mt-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</>
              ) : (
                <><Lock size={15} />Sign In to Admin<ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          &copy; {new Date().getFullYear()} Denova PK. All rights reserved.
        </p>
      </div>
    </div>
  );
}