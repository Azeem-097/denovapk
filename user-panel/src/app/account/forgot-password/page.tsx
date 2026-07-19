"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Mail, CheckCircle, Send } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 1000));
    setSentEmail(data.email);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="max-w-md mx-auto px-4 sm:px-6">

        <FadeIn>
          <Link
            href="/account/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#3b5f8f] transition-colors mb-8"
          >
            <ArrowLeft size={13} />
            Back to login
          </Link>
        </FadeIn>

        <FadeIn>
          <Link href="/" className="flex flex-col leading-none mb-10">
            <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold tracking-[0.08em] text-[#1a1a1a]">
              DENOVA
            </span>
            <span className="text-[9px] font-medium tracking-[0.35em] text-[#3b5f8f] uppercase">
              Pakistan
            </span>
          </Link>
        </FadeIn>

        {!sent ? (
          <>
            <FadeIn delay={100}>
              <div className="mb-8">
                <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#3b5f8f]">
                  Account Recovery
                </span>
                <TextReveal as="h1" delay={150}>
                  <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#1a1a1a] mt-2 block">
                    Forgot Password?
                  </span>
                </TextReveal>
                <p className="text-sm text-[#6b7280] mt-2 leading-relaxed">
                  Enter your email address and we will send you a link to reset your password.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="bg-white border border-[#e5e7eb] p-6 sm:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Email Address"
                    required
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...register("email")}
                    error={errors.email?.message}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white py-3.5 text-sm font-semibold tracking-wide hover:bg-[#3b5f8f] transition-colors disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-[#6b7280]">
                  Remember your password?{" "}
                  <Link href="/account/login" className="text-[#3b5f8f] font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </FadeIn>
          </>
        ) : (
          <FadeIn>
            <div className="bg-white border border-[#e5e7eb] p-8 text-center">
              <div className="w-16 h-16 bg-[#f5f0e8] rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-[#3b5f8f]" />
              </div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] mb-2">
                Check Your Inbox
              </h2>
              <p className="text-sm text-[#6b7280] leading-relaxed mb-2">
                We have sent a password reset link to:
              </p>
              <p className="text-sm font-semibold text-[#1a1a1a] mb-6">
                {sentEmail}
              </p>
              <div className="bg-[#fafaf9] border border-[#e5e7eb] p-4 text-left mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={14} className="text-[#3b5f8f]" />
                  <p className="text-xs font-semibold text-[#1a1a1a]">What to do next:</p>
                </div>
                <ul className="space-y-1 text-xs text-[#6b7280]">
                  <li>1. Open the email from hello@denovapk.com</li>
                  <li>2. Click the reset password link (valid for 1 hour)</li>
                  <li>3. Create a new secure password</li>
                  <li>4. Sign in with your new password</li>
                </ul>
              </div>
              <p className="text-xs text-[#6b7280] mb-4">
                Did not receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-[#3b5f8f] hover:underline font-medium"
                >
                  try again
                </button>
              </p>
              <Link
                href="/account/login"
                className="inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 text-sm font-semibold hover:bg-[#3b5f8f] transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}