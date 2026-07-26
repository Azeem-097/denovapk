"use client";
import { useEffect, useState } from "react";
import { Gift, X, Cake } from "lucide-react";

export function BirthdayBanner() {
  const [profile, setProfile] = useState<{ birthday: string | null } | null>(null);
  const [birthday, setBirthday] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Check if dismissed this session
    if (typeof window !== "undefined" && sessionStorage.getItem("bday-banner-dismissed") === "1") {
      setDismissed(true);
    }

    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.user) setProfile({ birthday: d.user.birthday });
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!birthday) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthday }),
      });
      if (res.ok) {
        setSaved(true);
        setProfile({ birthday });
      }
    } catch {}
    setSaving(false);
  };

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bday-banner-dismissed", "1");
    }
    setDismissed(true);
  };

  // Don't show if user has birthday, banner was dismissed, or profile hasn't loaded
  if (!profile) return null;
  if (profile.birthday) return null;
  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#f5f0e8] via-[#f5f0e8] to-[#f5f0e8]/50 border-2 border-[#E10600]/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-5">
        <Cake size={160} className="text-[#E10600] -mt-4 -mr-4" />
      </div>

      <div className="relative p-5 sm:p-6">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        {saved ? (
          <div className="text-center py-4">
            <Gift size={32} className="text-[#E10600] mx-auto mb-2" />
            <p className="text-lg font-bold text-[#1a1a1a]">Birthday Saved! 🎉</p>
            <p className="text-sm text-[#6b7280] mt-1">
              We&apos;ll surprise you with a special discount on your birthday!
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-[#E10600] flex items-center justify-center flex-shrink-0">
              <Gift size={20} className="text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#1a1a1a]">
                Add your birthday for exclusive gifts! 🎁
              </h3>
              <p className="text-sm text-[#6b7280] mt-1 mb-4 pr-8">
                Get a special discount and free gift on your birthday. It only takes a second!
              </p>

              <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="flex-1 px-3 py-2.5 text-sm border border-[#E10600]/30 bg-white focus:border-[#E10600] focus:outline-none"
                />
                <button
                  onClick={handleSave}
                  disabled={!birthday || saving}
                  className="bg-[#1a1a1a] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#E10600] transition-colors disabled:opacity-40"
                >
                  {saving ? "Saving..." : "Save Birthday"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}