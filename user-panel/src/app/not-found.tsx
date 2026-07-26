import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-[#fafaf9]">
      <div className="text-center px-4">
        <p className="font-[family-name:var(--font-cormorant)] text-8xl sm:text-9xl font-light text-[#E10600] leading-none mb-4">
          404
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-3">
          Page Not Found
        </h1>
        <p className="text-sm text-[#6b7280] mb-8 max-w-sm mx-auto leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-[#1a1a1a] text-white px-7 py-3 text-sm font-semibold tracking-wide hover:bg-[#E10600] transition-colors duration-300"
          >
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center border border-[#1a1a1a] text-[#1a1a1a] px-7 py-3 text-sm font-semibold tracking-wide hover:bg-[#1a1a1a] hover:text-white transition-colors duration-300"
          >
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}