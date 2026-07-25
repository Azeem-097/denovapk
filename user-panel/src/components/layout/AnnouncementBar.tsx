"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Truck, Flame, Gift, Sparkles, Gem, Zap, Star } from "lucide-react";

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
  accentColor:       "#3b5f8f",
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
  const [dismissed, setDismissed] = useState(false);
  const [paused,    setPaused]    = useState(false);

  useEffect(() => {
    fetch("/api/announcement-bar")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.config) setConfig(data.config);
        else setConfig(FALLBACK_CONFIG);
      })
      .catch(() => setConfig(FALLBACK_CONFIG));
  }, []);

  if (!config || !config.enabled || dismissed || config.messages.length === 0) return null;

  const bg      = config.bgColor      || "#0d0d0d";
  const fg      = config.textColor    || "#ffffff";
  const accent  = config.accentColor  || "#3b5f8f";
  const activeMessages = config.messages
    .filter((message) => message.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (activeMessages.length === 0) return null;

  const renderMessage = (message: AnnouncementMessage, key: string) => {
    const Icon = pickIcon(message.text);
    const item = (
      <div className="flex items-center gap-2 sm:gap-3 leading-none">
        <Icon
          size={13}
          strokeWidth={2}
          className="flex-shrink-0 announcement-icon-glow"
          style={{ color: accent }}
        />
        <p className="font-semibold tracking-[0.2em] uppercase text-[10px] sm:text-[12px] whitespace-nowrap">
          {message.text}
        </p>
      </div>
    );

    return message.link ? (
      <Link key={key} href={message.link} className="transition-all hover:opacity-90" style={{ color: fg }}>
        {item}
      </Link>
    ) : (
      <div key={key}>
        {item}
      </div>
    );
  };

  const separator = (key: string) => (
    <span
      key={key}
      className="mx-4 sm:mx-8 h-1 w-1 flex-shrink-0 rounded-full announcement-dot-pulse"
      style={{ backgroundColor: accent }}
      aria-hidden="true"
    />
  );

  const tickerSet = (setKey: string) => (
    <div key={setKey} className="flex items-center pr-8 sm:pr-12">
      {activeMessages.flatMap((message, index) => [
        renderMessage(message, `${setKey}-${message.id}`),
        separator(`${setKey}-separator-${message.id}-${index}`),
      ])}
    </div>
  );

  return (
    <div
      className="relative z-50 w-full overflow-hidden select-none announcement-bar-shell"
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

      <div className="h-10 sm:h-11 relative">
        <div className="h-full flex items-center justify-center relative">
          <div className="flex-1 flex items-center justify-center overflow-hidden min-w-0">
            <div className="w-full overflow-hidden">
              <div
                className="flex w-max whitespace-nowrap announcement-marquee-long"
                style={{ animationPlayState: paused ? "paused" : "running" }}
              >
                {tickerSet("set-a")}
                {tickerSet("set-b")}
                {tickerSet("set-c")}
                {tickerSet("set-d")}
              </div>
            </div>
          </div>

          {config.dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className="absolute right-2 sm:right-2 opacity-50 hover:opacity-100 transition-all hover:scale-110 hover:rotate-90 z-10"
              style={{ color: fg }}
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

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
