"use client";
import { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScaleIn } from "@/components/animations/ScaleIn";
import { SlideIn } from "@/components/animations/SlideIn";
import { useToastStore } from "@/store/toastStore";

// ═══════════════════════════════════════════════════════════
//  Cloudinary hero images
// ═══════════════════════════════════════════════════════════
const BASE            = "https://res.cloudinary.com/djy5qqco7/image/upload";
const IMAGE_ID        = "v1784387547/denovapk/general/newsletter_hires_1784387491499";
const IMAGE_ID_MOBILE = "v1784389913/denovapk/general/newsletter-mbl_1784389867961";

const buildUrl = (width: number) =>
  `${BASE}/f_auto,q_auto:best,c_limit,w_${width}/${IMAGE_ID}`;

const IMG_640  = buildUrl(640);
const IMG_900  = buildUrl(900);
const IMG_1200 = buildUrl(1200);
const IMG_1600 = buildUrl(1600);
const IMG_1915 = buildUrl(1915);

const buildMblUrl = (width: number) =>
  `${BASE}/f_auto,q_auto:best,c_limit,w_${width}/${IMAGE_ID_MOBILE}`;

const IMG_MBL_640  = buildMblUrl(640);
const IMG_MBL_900  = buildMblUrl(900);
const IMG_MBL_1200 = buildMblUrl(1200);

export function NewsletterSection() {
  const [email, setEmail]         = useState("");
  const [status, setStatus]       = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isFocused, setIsFocused] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading" || status === "success") return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage-newsletter" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong");

      setStatus("success");
      setEmail("");
      addToast({
        type: "success",
        message: data?.message === "Already subscribed"
          ? "You're already part of the Denova community!"
          : "Welcome to Denova! Check your inbox soon.",
      });

      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to subscribe";
      setStatus("error");
      addToast({ type: "error", message });
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const srcSet = [
    `${IMG_640}  640w`,
    `${IMG_900}  900w`,
    `${IMG_1200} 1200w`,
    `${IMG_1600} 1600w`,
    `${IMG_1915} 1915w`,
  ].join(", ");

  const srcSetMobile = [
    `${IMG_MBL_640}  640w`,
    `${IMG_MBL_900}  900w`,
    `${IMG_MBL_1200} 1200w`,
  ].join(", ");

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative bg-[#f5f0e8] overflow-hidden"
    >
      {/* MOBILE LAYOUT */}
      <div className="lg:hidden">
        <div className="relative w-full aspect-square overflow-hidden bg-[#f5f0e8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMG_MBL_900}
            srcSet={srcSetMobile}
            sizes="100vw"
            alt="Denova denim jeans on premium models"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="site-container flex justify-center pt-6 sm:pt-8">
          <Link
            href="/shop"
            className="shimmer-btn hover-lift inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-10 py-4 text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#3b5f8f] transition-all duration-300 shadow-md"
          >
            Shop Now
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="site-container pt-8 pb-6 sm:pt-10 sm:pb-8">
          <NewsletterContent
            email={email}
            setEmail={setEmail}
            status={status}
            isFocused={isFocused}
            setIsFocused={setIsFocused}
            onSubmit={handleSubmit}
            align="center"
          />
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:block relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMG_1600}
          srcSet={srcSet}
          sizes="100vw"
          alt="Five men modeling premium Denova denim jeans against a warm cream backdrop"
          className="block w-full h-auto"
          loading="lazy"
          decoding="async"
        />

        <div
          className="absolute inset-y-0 left-0 w-[55%] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, #f5f0e8 0%, #f5f0e8 55%, rgba(245,240,232,0.85) 80%, rgba(245,240,232,0) 100%)",
          }}
        />

        <div
          className="absolute top-[8%] left-[4%] w-40 h-40 rounded-full bg-[#3b5f8f]/8 animate-float-soft pointer-events-none"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-[10%] left-[8%] w-32 h-32 rounded-full bg-[#3b5f8f]/6 animate-float-soft pointer-events-none"
          style={{ animationDuration: "10s", animationDelay: "1s" }}
        />

        <div
          className="absolute inset-y-0 left-0 w-[45%] opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="absolute inset-0 site-container flex items-center">
          <div className="w-full max-w-[560px] lg:pr-8">
            <NewsletterContent
              email={email}
              setEmail={setEmail}
              status={status}
              isFocused={isFocused}
              setIsFocused={setIsFocused}
              onSubmit={handleSubmit}
              align="left"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

interface NewsletterContentProps {
  email:        string;
  setEmail:     (v: string) => void;
  status:       "idle" | "loading" | "success" | "error";
  isFocused:    boolean;
  setIsFocused: (v: boolean) => void;
  onSubmit:     (e: React.FormEvent) => void;
  align:        "left" | "center";
}

function NewsletterContent({
  email, setEmail, status, isFocused, setIsFocused, onSubmit, align,
}: NewsletterContentProps) {
  const isLeft = align === "left";
  const textAlign = isLeft ? "text-left" : "text-center";
  const flexAlign = isLeft ? "items-start" : "items-center";

  return (
    <div className={`flex flex-col ${flexAlign} ${textAlign}`}>

      <FadeIn>
        <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#3b5f8f]">
          <Sparkles size={12} className="opacity-80" />
          Join the Community
        </span>
      </FadeIn>

      <TextReveal as="h2" delay={100}>
        <span
          id="newsletter-heading"
          className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-[2.5rem] xl:text-5xl font-bold text-[#1a1a1a] mt-4 block leading-[1.05]"
        >
          Dress the Part.
          <br />
          <span className="text-[#3b5f8f] italic font-normal">Live the Legacy.</span>
        </span>
      </TextReveal>

      <FadeIn delay={200}>
        <p className={`text-[#4a4a4a] text-sm sm:text-base leading-relaxed mt-4 max-w-md ${isLeft ? "" : "mx-auto"}`}>
          Get first access to new denim drops, exclusive member-only pricing,
          and styling notes crafted by our design team &mdash; delivered to your inbox.
        </p>
      </FadeIn>

      {isLeft && (
        <SlideIn from="left" distance={20} delay={280} duration={600}>
          <ul className="mt-5 space-y-2">
            {[
              "10% off your first order",
              "Early access to limited collections",
              "Insider styling tips & lookbooks",
            ].map((perk) => (
              <li key={perk} className="flex items-center gap-2.5 text-sm text-[#4a4a4a]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b5f8f] flex-shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
        </SlideIn>
      )}

      <ScaleIn from={0.95} delay={350}>
        <form
          onSubmit={onSubmit}
          className={`mt-6 flex flex-col sm:flex-row gap-3 w-full ${isLeft ? "max-w-md" : "max-w-lg mx-auto"}`}
        >
          <div className="flex-1 relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter your email address"
              required
              autoComplete="email"
              aria-label="Email address for newsletter"
              className="input-focus-gold w-full px-5 py-3.5 text-sm text-[#1a1a1a] bg-white border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none transition-all duration-300 placeholder:text-[#6b7280]/60 rounded-none"
              disabled={status === "loading" || status === "success"}
            />
            <span
              className="absolute bottom-0 left-0 h-[2px] bg-[#3b5f8f] transition-transform duration-500 origin-left w-full"
              style={{ transform: isFocused ? "scaleX(1)" : "scaleX(0)" }}
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="shimmer-btn inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#3b5f8f] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0 hover-lift"
          >
            {status === "loading" ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Subscribing...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle size={16} className="animate-fade-zoom-in" />
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
      </ScaleIn>

      {status === "success" && (
        <div className={`mt-4 text-sm text-[#3b5f8f] font-medium animate-fade-zoom-in ${isLeft ? "" : "text-center"}`}>
          Thank you! You&apos;re now part of the Denova community. 🎉
        </div>
      )}

      <FadeIn delay={450}>
        <p className={`mt-4 text-[11px] text-[#6b7280]/80 tracking-wide ${isLeft ? "" : "text-center"}`}>
          No spam, ever. Unsubscribe anytime. By subscribing you agree to our{" "}
          <a href="/privacy" className="underline decoration-dotted underline-offset-2 hover:text-[#3b5f8f] transition-colors">
            privacy policy
          </a>.
        </p>
      </FadeIn>
    </div>
  );
}