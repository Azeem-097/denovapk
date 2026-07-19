"use client";
import { useEffect, useRef, useState } from "react";

export function FixedFooterReveal({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer:   React.ReactNode;
}) {
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      if (h > 0) setFooterHeight(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div ref={footerRef} className="fixed bottom-0 left-0 right-0 z-0 w-full">
        {footer}
      </div>
      <div
        className="relative z-10 bg-white rounded-b-[40px] sm:rounded-b-[50px] lg:rounded-b-[60px]"
        style={{
          marginBottom: footerHeight > 0 ? `${footerHeight}px` : undefined,
          boxShadow: "0 8px 40px -10px rgba(0, 0, 0, 0.12), 0 -8px 40px -10px rgba(0, 0, 0, 0.12)",
        }}
      >
        {children}
      </div>
    </>
  );
}