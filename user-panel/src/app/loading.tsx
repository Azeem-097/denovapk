export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#e5e7eb] border-t-[#3b5f8f] rounded-full animate-spin" />
        <p className="text-xs tracking-[0.2em] uppercase text-[#6b7280]">
          Loading
        </p>
      </div>
    </div>
  );
}