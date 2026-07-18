"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Gift } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { FadeIn } from "@/components/animations/FadeIn";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [agree,        setAgree]        = useState(false);

  const registerFn = useAuthStore((s) => s.register);
  const showToast  = useToastStore((s) => s.addToast);

  const {
    register, handleSubmit, setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData & { birthday?: string }>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData & { birthday?: string }) => {
    const result = await registerFn({
      firstName: data.firstName,
      lastName:  data.lastName,
      email:     data.email,
      phone:     data.phone,
      password:  data.password,
      birthday:  data.birthday || undefined,
    });
    if (result.success) {
      showToast({ type: "success", message: "Account created!" });
      router.push("/account/dashboard");
    } else {
      showToast({ type: "error", message: result.error || "Registration failed" });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block order-2 lg:order-1">
        <Image src="https://res.cloudinary.com/djy5qqco7/image/upload/v1784396664/denovapk/general/signup_1784396631376.png"
          alt="Denova PK fashion" fill className="object-cover" sizes="50vw" priority />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/20 to-transparent" />
        <div className="absolute bottom-16 left-16 right-16">
          <p className="font-[family-name:var(--font-cormorant)] text-3xl xl:text-4xl font-light text-white leading-relaxed italic">
            &ldquo;Join a community that celebrates craftsmanship, quality, and timeless style.&rdquo;
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-px bg-[#c9a96e]" />
            <p className="text-xs tracking-[0.25em] uppercase text-white/70">Denova PK</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-16 xl:px-24 py-16 lg:py-12 min-h-screen order-1 lg:order-2">
        <div className="w-full max-w-md mx-auto">
          <FadeIn>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#c9a96e] transition-colors mb-8">
              <ArrowLeft size={13} /> Back to home
            </Link>
          </FadeIn>

          <FadeIn>
            <Link href="/" className="flex flex-col leading-none mb-8">
              <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold tracking-[0.08em] text-[#1a1a1a]">DENOVA</span>
              <span className="text-[9px] font-medium tracking-[0.35em] text-[#c9a96e] uppercase">Pakistan</span>
            </Link>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="mb-6">
              <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">New Here</span>
              <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#1a1a1a] mt-2">
                Create your account
              </h1>
              <p className="text-sm text-[#6b7280] mt-2">Join us for exclusive access to new arrivals</p>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" required placeholder="Muhammad" {...register("firstName")} error={errors.firstName?.message} />
                <Input label="Last Name" required placeholder="Ahmad" {...register("lastName")} error={errors.lastName?.message} />
              </div>
              <Input label="Email" required type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} error={errors.email?.message} />
              <Input label="Phone" required type="tel" placeholder="+92 300 1234567" {...register("phone")} error={errors.phone?.message} />

              {/* Birthday field with gift icon */}
              <div>
                <label className="block text-xs font-medium tracking-wide text-[#1a1a1a] mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <Gift size={12} className="text-[#c9a96e]" />
                    Birthday
                    <span className="text-[#6b7280] font-normal normal-case tracking-normal ml-1">(optional)</span>
                  </span>
                </label>
                <input
                  type="date"
                  {...register("birthday")}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-3.5 py-3 text-sm text-[#1a1a1a] bg-white border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none transition-colors"
                />
                <p className="mt-1 text-[10px] text-[#c9a96e]">
                  🎁 Add your birthday to receive exclusive gifts and special discounts!
                </p>
              </div>

              <div className="relative">
                <Input label="Password" required type={showPassword ? "text" : "password"} placeholder="At least 8 characters" {...register("password")} error={errors.password?.message} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-[#6b7280]">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <Input label="Confirm Password" required type={showConfirm ? "text" : "password"} placeholder="Re-enter your password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-[38px] text-[#6b7280]">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer group pt-1">
                <div onClick={() => { setAgree(!agree); setValue("agree", !agree); }}
                  className={`mt-0.5 w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    agree ? "border-[#c9a96e] bg-[#c9a96e]" : "border-[#e5e7eb] group-hover:border-[#c9a96e]"
                  }`}>
                  {agree && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-xs text-[#6b7280] leading-relaxed">
                  I agree to the <Link href="/terms" className="text-[#c9a96e] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#c9a96e] hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.agree && <p className="text-[11px] text-red-500 font-medium">{errors.agree.message}</p>}

              <button type="submit" disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white py-3.5 text-sm font-semibold tracking-wide hover:bg-[#c9a96e] transition-colors disabled:opacity-60 mt-2">
                {isSubmitting ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account...</>
                ) : (
                  <>Create Account<ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </FadeIn>

          <FadeIn delay={300}>
            <p className="mt-6 text-center text-sm text-[#6b7280]">
              Already have an account?{" "}
              <Link href="/account/login" className="text-[#c9a96e] font-semibold hover:underline">Sign in</Link>
            </p>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}