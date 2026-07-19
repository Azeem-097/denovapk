"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { X, Truck, Flame, Gift, Sparkles, Gem, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementMessage {
  id:        string;
  text:      string;
  link:      string;
  isActive:  boolean;
  sortOrder: number;
}

interface AnnouncementConfig {
  enabled:           boolean;
  autoRotateSeconds: number;
  dismissible:       boolean;
  bgColor:           string;
  textColor:         string;
  accentColor:       string;
  messages:          AnnouncementMessage[];
}

const FALLBACK_CONFIG: AnnouncementConfig = {
  enabled:           true,
  autoRotateSeconds: 5,
  dismissible:       true,
  bgColor:           "#0d0d0d",
  textColor:         "#ffffff",
  accentColor:       "#3b5f8f", // Blue accent
  messages: [
    { id: "m1", text: "Free shipping on orders above PKR 5,000", link: "", isActive: true, sortOrder: 0 },
  ],
};

function pickIcon(text: string) {
  const t = text.toLowerCase();
  if (/(ship|delivery|deliver|courier)/.test(t))         return Truck;
  if (/(sale|off|discount|deal|save)/.test(t))            return Flame;
  if (/(gift|reward|bonus|free)/.test(t))                 return Gift;
  if (/(new|arrival|launch|drop|introducing)/.test(t))    return Sparkles;
  if (/(premium|luxury|exclusive|selvedge)/.test(t))      return Gem;
  if (/(limited|hurry|ends|last chance|today)/.test(t))   return Zap;
  return Star;
}

export function AnnouncementBar() {
  const [config,    setConfig]    = useState<AnnouncementConfig | null>(null);
  const [current,   setCurrent]   = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [paused,    setPaused]    = useState(false);
  const [progress,  setProgress]  = useState(0);

  useEffect(() => {
    fetch("/api/announcement-bar")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.config) setConfig(data.config);
        else setConfig(FALLBACK_CONFIG);
      })
      .catch(() => setConfig(FALLBACK_CONFIG));
  }, []);

  const rotateMs = useMemo(() => {
    if (!config) return 5000;
    return Math.max(2000, config.autoRotateSeconds * 1000);
  }, [config]);

  useEffect(() => {
    if (!config || config.messages.length <= 1 || paused) return;
    setProgress(0);
    const startedAt = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(100, (elapsed / rotateMs) * 100);
      setProgress(pct);
    }, 33);
    return () => clearInterval(id);
  }, [current, rotateMs, config, paused]);

  useEffect(() => {
    if (!config || config.messages.length <= 1 || paused) return;
    const t = setTimeout(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % config.messages.length);
        setAnimating(false);
      }, 400);
    }, rotateMs);
    return () => clearTimeout(t);
  }, [config, current, rotateMs, paused]);

  if (!config || !config.enabled || dismissed || config.messages.length === 0) return null;

  const message = config.messages[current];
  const Icon    = pickIcon(message.text);
  const bg      = config.bgColor      || "#0d0d0d";
  const fg      = config.textColor    || "#ffffff";
  const accent  = config.accentColor  || "#3b5f8f"; // Blue

  const isLong  = message.text.length > 70;
  const hasMany = config.messages.length > 1;

  const messageInner = (
    <div className="flex items-center gap-2.5 leading-none">
      <Icon
        size={13}
        strokeWidth={2}
        className="flex-shrink-0 announcement-icon-glow"
        style={{ color: accent }}
      />
      <p className="font-semibold tracking-[0.18em] uppercase text-[11px] sm:text-[12px]">
        {message.text}
      </p>
      <Icon
        size={13}
        strokeWidth={2}
        className="flex-shrink-0 announcement-icon-glow hidden sm:inline-block"
        style={{ color: accent }}
      />
    </div>
  );

  return (
    <div
      className="relative w-full overflow-hidden select-none announcement-bar-shell"
      style={{
        background: `linear-gradient(90deg, ${bg} 0%, ${bg} 40%, ${shade(bg, 12)} 50%, ${bg} 60%, ${bg} 100%)`,
        backgroundSize: "200% 100%",
        color: fg,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />

      <div className="site-container h-10 sm:h-11 relative">
        <div className="h-full flex items-center justify-center relative">
          <div className="hidden sm:flex absolute left-4 items-center gap-2 opacity-70">
            <span className="w-1 h-1 rounded-full announcement-dot-pulse" style={{ backgroundColor: accent }} />
            <span className="w-4 h-px" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
          </div>

          <div className="hidden sm:flex absolute right-14 items-center gap-2 opacity-70">
            <span className="w-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent})` }} />
            <span className="w-1 h-1 rounded-full announcement-dot-pulse" style={{ backgroundColor: accent, animationDelay: "0.9s" }} />
          </div>

          <div className="flex-1 flex items-center justify-center overflow-hidden px-8 sm:px-16">
            {isLong ? (
              <div className="w-full overflow-hidden">
                <div className="flex whitespace-nowrap announcement-marquee">
                  <div className="flex items-center gap-16 pr-16">
                    {messageInner}{messageInner}{messageInner}{messageInner}
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={message.id + current}
                className={cn(
                  "transition-all duration-400 ease-out",
                  animating ? "opacity-0 -translate-y-2 blur-[3px]" : "opacity-100 translate-y-0 blur-0 announcement-glow-in"
                )}
              >
                {message.link ? (
                  <Link href={message.link} className="transition-all hover:opacity-90" style={{ color: fg }}>
                    {messageInner}
                  </Link>
                ) : messageInner}
              </div>
            )}
          </div>

          {config.dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className="absolute right-3 sm:right-4 opacity-50 hover:opacity-100 transition-all hover:scale-110 hover:rotate-90"
              style={{ color: fg }}
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {hasMany && (
        <div
          className="absolute bottom-0 left-0 h-px transition-all duration-100 ease-linear"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${accent}, ${lighten(accent, 30)})`,
            boxShadow: `0 0 8px ${accent}, 0 0 4px ${accent}`,
          }}
        />
      )}
    </div>
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return "#" + to(r) + to(g) + to(b);
}
function shade(hex: string, amt: number): string {
  try {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(r + amt, g + amt, b + amt);
  } catch { return hex; }
}
function lighten(hex: string, amt: number): string { return shade(hex, amt); }