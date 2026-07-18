"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { FadeIn } from "@/components/animations/FadeIn";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";

const DEMO = { email: "ayesha@example.com", password: "demo1234" };

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [remember,     setRemember]     = useState(true);

  const login     = useAuthStore((s) => s.login);
  const showToast = useToastStore((s) => s.addToast);

  const {
    register, handleSubmit, setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      showToast({ type: "success", message: "Welcome back!" });
      router.push("/account/dashboard");
    } else {
      showToast({ type: "error", message: result.error || "Login failed" });
    }
  };

  const fillDemo = () => {
    setValue("email",    DEMO.email);
    setValue("password", DEMO.password);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-16 xl:px-24 py-16 lg:py-12 min-h-screen">
        <div className="w-full max-w-md mx-auto">

          <FadeIn>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#c9a96e] transition-colors mb-8">
              <ArrowLeft size={13} />
              Back to home
            </Link>
          </FadeIn>

          <FadeIn>
            <Link href="/" className="flex flex-col leading-none mb-10">
              <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold tracking-[0.08em] text-[#1a1a1a]">
                DENOVA
              </span>
              <span className="text-[9px] font-medium tracking-[0.35em] text-[#c9a96e] uppercase">
                Pakistan
              </span>
            </Link>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="mb-8">
              <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
                Welcome Back
              </span>
              <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#1a1a1a] mt-2">
                Sign in to your account
              </h1>
              <p className="text-sm text-[#6b7280] mt-2">
                Continue your shopping experience
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="mb-6 p-3 bg-[#f5f0e8] border border-[#c9a96e]/30 text-xs text-[#1a1a1a]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-[#c9a96e] uppercase tracking-wider text-[10px]">Demo Account</p>
                  <p className="mt-1">{DEMO.email} / {DEMO.password}</p>
                </div>
                <button type="button" onClick={fillDemo} className="text-xs font-semibold text-[#c9a96e] hover:text-[#b8955a] underline">
                  Fill
                </button>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email" required type="email" placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
                error={errors.email?.message}
              />
              <div className="relative">
                <Input
                  label="Password" required
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password" autoComplete="current-password"
                  {...register("password")}
                  error={errors.password?.message}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-[#6b7280] hover:text-[#1a1a1a]">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div onClick={() => setRemember(!remember)}
                    className={`w-4 h-4 border-2 flex items-center justify-center transition-all ${
                      remember ? "border-[#c9a96e] bg-[#c9a96e]" : "border-[#e5e7eb] group-hover:border-[#c9a96e]"
                    }`}>
                    {remember && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="text-xs text-[#6b7280]">Remember me</span>
                </label>
                <Link href="/account/forgot-password" className="text-xs text-[#c9a96e] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white py-3.5 text-sm font-semibold tracking-wide hover:bg-[#c9a96e] transition-colors disabled:opacity-60 mt-2">
                {isSubmitting ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</>
                ) : (
                  <>Sign In<ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </FadeIn>

          <FadeIn delay={300}>
            <p className="mt-8 text-center text-sm text-[#6b7280]">
              Don&apos;t have an account?{" "}
              <Link href="/account/register" className="text-[#c9a96e] font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <Image
          src="https://res.cloudinary.com/djy5qqco7/image/upload/v1784396631/denovapk/general/signin_1784396626556.png"
          alt="Denova PK fashion" fill className="object-cover" sizes="50vw" priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/20 to-transparent" />
        <div className="absolute bottom-16 left-16 right-16">
          <p className="font-[family-name:var(--font-cormorant)] text-3xl xl:text-4xl font-light text-white leading-relaxed italic">
            &ldquo;Discover clothing that speaks to who you are, and who you aspire to be.&rdquo;
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-px bg-[#c9a96e]" />
            <p className="text-xs tracking-[0.25em] uppercase text-white/70">Denova PK</p>
          </div>
        </div>
      </div>
    </div>
  );
}