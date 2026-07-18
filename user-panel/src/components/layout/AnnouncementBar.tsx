"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

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
  bgColor:           "#1a1a1a",
  textColor:         "#ffffff",
  accentColor:       "#c9a96e",
  messages: [
    { id: "m1", text: "Free shipping on orders above PKR 5,000", link: "", isActive: true, sortOrder: 0 },
  ],
};

export function AnnouncementBar() {
  const [config,    setConfig]    = useState<AnnouncementConfig | null>(null);
  const [current,   setCurrent]   = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Fetch config from API
  useEffect(() => {
    fetch("/api/announcement-bar")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.config) setConfig(data.config);
        else setConfig(FALLBACK_CONFIG);
      })
      .catch(() => setConfig(FALLBACK_CONFIG));
  }, []);

  // Auto-rotate messages
  useEffect(() => {
    if (!config || config.messages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % config.messages.length);
    }, Math.max(1, config.autoRotateSeconds) * 1000);
    return () => clearInterval(interval);
  }, [config]);

  // Don't render if disabled, dismissed, or no messages
  if (!config) return null;
  if (!config.enabled) return null;
  if (dismissed) return null;
  if (config.messages.length === 0) return null;

  const message = config.messages[current] ?? config.messages[0];
  if (!message) return null;

  const content = (
    <p className="text-center leading-none font-medium tracking-[0.12em]">
      {message.text}
    </p>
  );

  return (
    <div
      className="w-full text-xs tracking-widest uppercase"
      style={{ backgroundColor: config.bgColor, color: config.textColor }}
    >
      <div className="site-container h-9 flex items-center justify-center gap-4 relative">
        {message.link ? (
          <Link
            href={message.link}
            className="transition-opacity hover:opacity-80"
            style={{ color: config.textColor }}
          >
            {content}
          </Link>
        ) : (
          content
        )}

        {config.dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-4 opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: config.textColor }}
            aria-label="Dismiss announcement"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}