"use client";
import { useState } from "react";
import { X } from "lucide-react";

const announcements = [
  "Free shipping on orders above PKR 5,000",
  "New Summer Collection is now live — Shop Now",
  "Use code DENOVA10 for 10% off your first order",
];

export function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-[#1a1a1a] text-white text-xs tracking-widest uppercase">
      <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between gap-4">

        {/* Left spacer */}
        <div className="w-6 hidden sm:block" />

        {/* Message + dots */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1">
          <p className="text-center leading-none font-medium tracking-[0.12em]">
            {announcements[current]}
          </p>
          {/* Dot indicators */}
          <div className="flex gap-1 mt-0.5">
            {announcements.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1 h-1 rounded-full transition-all duration-300 ${
                  i === current ? "bg-[#c9a96e] w-3" : "bg-white/40"
                }`}
                aria-label={`Announcement ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="text-white/60 hover:text-white transition-colors flex-shrink-0"
          aria-label="Dismiss announcement"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}