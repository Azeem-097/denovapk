"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { ScaleIn } from "@/components/animations/ScaleIn";
import { SlideIn } from "@/components/animations/SlideIn";

// ═══════════════════════════════════════════════════════════
//  Cloudinary hero images (unchanged)
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

// ═══════════════════════════════════════════════════════════
//  Community config — matches /api/whatsapp-widget shape
// ═══════════════════════════════════════════════════════════
interface CommunityConfig {
  communityLink:    string;
  communityLabel:   string;
  communitySubtext: string;
}

const FALLBACK: CommunityConfig = {
  communityLink:    "",
  communityLabel:   "Join Community",
  communitySubtext: "Join our WhatsApp community",
};

/**
 * NewsletterSection — repurposed as WhatsApp Community CTA.
 *
 * Reads communityLink / labels from settings via /api/whatsapp-widget.
 * If the admin has not configured a communityLink, the button gracefully
 * degrades to a "Shop Now" link so the section still looks intentional.
 *
 * Component name kept as NewsletterSection so the homepage import
 * (app/page.tsx) does not need to change.
 */
export function NewsletterSection() {
  const [config, setConfig] = useState<CommunityConfig>(FALLBACK);

  useEffect(() => {
    fetch("/api/whatsapp-widget")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.config) {
          setConfig({
            communityLink:    data.config.communityLink    ?? "",
            communityLabel:   data.config.communityLabel   ?? FALLBACK.communityLabel,
            communitySubtext: data.config.communitySubtext ?? FALLBACK.communitySubtext,
          });
        }
      })
      .catch(() => setConfig(FALLBACK));
  }, []);

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
      aria-labelledby="community-heading"
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
            className="shimmer-btn hover-lift inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-10 py-4 text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#E10600] transition-all duration-300 shadow-md"
          >
            Shop Now
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="site-container pt-8 pb-6 sm:pt-10 sm:pb-8">
          <CommunityContent config={config} align="center" />
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
          className="absolute top-[8%] left-[4%] w-40 h-40 rounded-full bg-[#E10600]/8 animate-float-soft pointer-events-none"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-[10%] left-[8%] w-32 h-32 rounded-full bg-[#E10600]/6 animate-float-soft pointer-events-none"
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
            <CommunityContent config={config} align="left" />
          </div>
        </div>
      </div>
    </section>
  );
}

interface CommunityContentProps {
  config: CommunityConfig;
  align:  "left" | "center";
}

function CommunityContent({ config, align }: CommunityContentProps) {
  const isLeft    = align === "left";
  const textAlign = isLeft ? "text-left" : "text-center";
  const flexAlign = isLeft ? "items-start" : "items-center";

  const hasLink = !!config.communityLink;

  return (
    <div className={`flex flex-col ${flexAlign} ${textAlign}`}>

      <FadeIn>
        <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#E10600]">
          <Sparkles size={12} className="opacity-80" />
          Join the Community
        </span>
      </FadeIn>

      <TextReveal as="h2" delay={100}>
        <span
          id="community-heading"
          className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-[2.5rem] xl:text-5xl font-bold text-[#1a1a1a] mt-4 block leading-[1.05]"
        >
          Dress the Part.
          <br />
          <span className="text-[#E10600] italic font-normal">Live the Legacy.</span>
        </span>
      </TextReveal>

      <FadeIn delay={200}>
        <p className={`text-[#4a4a4a] text-sm sm:text-base leading-relaxed mt-4 max-w-md ${isLeft ? "" : "mx-auto"}`}>
          Join our exclusive WhatsApp community for first access to new denim
          drops, member-only pricing, and styling notes crafted by our design
          team &mdash; straight to your chat.
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
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] flex-shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
        </SlideIn>
      )}

      <ScaleIn from={0.95} delay={350}>
        <div className={`mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 ${isLeft ? "" : "justify-center"}`}>
          {hasLink ? (
            <a
              href={config.communityLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shimmer-btn hover-lift group inline-flex items-center gap-2.5 bg-[#1a1a1a] text-white px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#25D366] transition-all duration-300 shadow-sm"
            >
              <WhatsAppIcon size={16} className="text-white" />
              <span>{config.communityLabel || "Join Community"}</span>
              <ArrowRight size={14} className="ml-0.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          ) : (
            <Link
              href="/shop"
              className="shimmer-btn hover-lift group inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#E10600] transition-all duration-300 shadow-sm"
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          <Link
            href="/shop"
            className="text-xs font-medium tracking-[0.15em] uppercase text-[#6b7280] hover:text-[#1a1a1a] transition-colors group inline-flex items-center gap-1.5"
          >
            Or shop the collection
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </ScaleIn>

      <FadeIn delay={480}>
        <p className={`mt-5 text-[11px] text-[#6b7280]/80 tracking-wide ${isLeft ? "" : "text-center"}`}>
          Free to join. Leave anytime. By joining you agree to our{" "}
          <a href="/privacy" className="underline decoration-dotted underline-offset-2 hover:text-[#E10600] transition-colors">
            privacy policy
          </a>.
        </p>
      </FadeIn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  WhatsApp brand icon (matches WhatsAppWidget)
// ═══════════════════════════════════════════════════════════
function WhatsAppIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.138.564 4.14 1.545 5.873L.057 23.997l6.306-1.654A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.017-1.376l-.36-.214-3.733.979 1-3.646-.234-.374A9.818 9.818 0 0 1 12 2.182c5.427 0 9.818 4.391 9.818 9.818 0 5.428-4.391 9.818-9.818 9.818z"/>
    </svg>
  );
}