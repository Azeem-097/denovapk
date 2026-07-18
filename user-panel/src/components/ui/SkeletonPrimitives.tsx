/**
 * Shimmer skeleton building blocks used by loading.tsx files.
 * All server-safe (no client hooks) - can be rendered instantly.
 */

export function SkelBar({ w = "100%", h = "1rem", className = "" }: { w?: string; h?: string; className?: string }) {
  return (
    <span
      className={`inline-block bg-[#f4f2ee] animate-pulse ${className}`}
      style={{ width: w, height: h }}
    />
  );
}

export function SkelBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-[#f4f2ee] animate-pulse ${className}`} />;
}