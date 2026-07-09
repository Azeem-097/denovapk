"use client";
import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setStatus("success");
    setEmail("");

    // Reset after 4 seconds
    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-[#f5f0e8] overflow-hidden">

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">

          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
              Stay Connected
            </span>
          </FadeIn>

          <TextReveal as="h2" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 block leading-tight">
              Join the Denova
              <br />
              Community
            </span>
          </TextReveal>

          <FadeIn delay={200}>
            <p className="text-[#6b7280] text-sm sm:text-base leading-relaxed mt-4 max-w-md mx-auto">
              Subscribe to get early access to new collections, exclusive offers,
              and styling inspiration delivered to your inbox.
            </p>
          </FadeIn>

          {/* Form */}
          <FadeIn delay={300}>
            <form
              onSubmit={handleSubmit}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            >
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full px-5 py-3.5 text-sm text-[#1a1a1a] bg-white border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none transition-colors duration-200 placeholder:text-[#6b7280]/60"
                  disabled={status === "loading" || status === "success"}
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#c9a96e] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
              >
                {status === "loading" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subscribing...
                  </>
                ) : status === "success" ? (
                  <>
                    <CheckCircle size={16} />
                    Subscribed!
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Subscribe
                  </>
                )}
              </button>
            </form>
          </FadeIn>

          {/* Success message */}
          {status === "success" && (
            <div className="mt-4 text-sm text-[#c9a96e] font-medium">
              Thank you! You&apos;re now part of the Denova community. 🎉
            </div>
          )}

          {/* Trust line */}
          <FadeIn delay={400}>
            <p className="mt-5 text-[11px] text-[#6b7280]/70 tracking-wide">
              No spam, ever. Unsubscribe anytime.
            </p>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}