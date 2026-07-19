import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "Find your perfect fit with the Denova PK size guide.",
};

const MENS_KURTA = [
  { size: "XS", chest: "34–35", waist: "28–29", length: "42", shoulder: "16" },
  { size: "S",  chest: "36–37", waist: "30–31", length: "43", shoulder: "17" },
  { size: "M",  chest: "38–39", waist: "32–33", length: "44", shoulder: "18" },
  { size: "L",  chest: "40–41", waist: "34–35", length: "45", shoulder: "19" },
  { size: "XL", chest: "42–43", waist: "36–37", length: "46", shoulder: "20" },
  { size: "XXL",chest: "44–46", waist: "38–40", length: "47", shoulder: "21" },
];

const MENS_SHIRTS = [
  { size: "XS", chest: "34–35", neck: "14",    sleeve: "32", length: "28" },
  { size: "S",  chest: "36–37", neck: "14.5",  sleeve: "33", length: "29" },
  { size: "M",  chest: "38–39", neck: "15",    sleeve: "34", length: "30" },
  { size: "L",  chest: "40–41", neck: "15.5",  sleeve: "35", length: "31" },
  { size: "XL", chest: "42–43", neck: "16",    sleeve: "36", length: "32" },
  { size: "XXL",chest: "44–46", neck: "16.5",  sleeve: "37", length: "33" },
];

const WOMENS_SUITS = [
  { size: "XS", bust: "32–33", waist: "26–27", hip: "34–35", length: "52" },
  { size: "S",  bust: "34–35", waist: "28–29", hip: "36–37", length: "53" },
  { size: "M",  bust: "36–37", waist: "30–31", hip: "38–39", length: "54" },
  { size: "L",  bust: "38–39", waist: "32–33", hip: "40–41", length: "55" },
  { size: "XL", bust: "40–41", waist: "34–35", hip: "42–43", length: "56" },
  { size: "XXL",bust: "42–44", waist: "36–38", hip: "44–46", length: "57" },
];

const TIPS = [
  { title: "Measure Correctly", desc: "Use a soft measuring tape. Stand straight and measure over light clothing for accurate results." },
  { title: "Chest / Bust", desc: "Measure around the fullest part of your chest, keeping the tape parallel to the ground." },
  { title: "Waist", desc: "Measure around your natural waistline, which is the narrowest part of your torso." },
  { title: "Hips", desc: "Measure around the fullest part of your hips, about 8 inches below your waist." },
  { title: "When Between Sizes", desc: "We recommend sizing up for a comfortable, relaxed fit, or sizing down for a more tailored look." },
];

export default function SizeGuidePage() {
  return (
    <>
      <div className="pt-28 pb-10 sm:pt-32 sm:pb-14 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Size Guide" }]}
              className="mb-4 justify-center"
            />
          </FadeIn>
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#3b5f8f]">
              Find Your Fit
            </span>
          </FadeIn>
          <TextReveal as="h1" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-2 block">
              Size Guide
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <p className="text-[#6b7280] text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
              All measurements are in inches. If you are between sizes, we recommend sizing up for comfort.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-12">

        {/* How to Measure Tips */}
        <FadeIn>
          <div className="bg-[#f5f0e8] border border-[#3b5f8f]/30 p-6 lg:p-8">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#1a1a1a] mb-5">
              How to Measure
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TIPS.map((tip) => (
                <div key={tip.title} className="bg-white p-4 border border-[#e5e7eb]">
                  <p className="text-xs font-bold text-[#3b5f8f] uppercase tracking-wider mb-1">{tip.title}</p>
                  <p className="text-xs text-[#6b7280] leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Men's Kurta */}
        <FadeIn>
          <SizeTable
            title="Men's Kurta"
            headers={["Size", "Chest (in)", "Waist (in)", "Length (in)", "Shoulder (in)"]}
            rows={MENS_KURTA.map((r) => [r.size, r.chest, r.waist, r.length, r.shoulder])}
          />
        </FadeIn>

        {/* Men's Shirts */}
        <FadeIn>
          <SizeTable
            title="Men's Shirts & Formal Wear"
            headers={["Size", "Chest (in)", "Neck (in)", "Sleeve (in)", "Length (in)"]}
            rows={MENS_SHIRTS.map((r) => [r.size, r.chest, r.neck, r.sleeve, r.length])}
          />
        </FadeIn>

        {/* Women's Suits */}
        <FadeIn>
          <SizeTable
            title="Women's Lawn / Formal Suits"
            headers={["Size", "Bust (in)", "Waist (in)", "Hip (in)", "Kameez Length (in)"]}
            rows={WOMENS_SUITS.map((r) => [r.size, r.bust, r.waist, r.hip, r.length])}
          />
        </FadeIn>

        {/* Note */}
        <FadeIn>
          <div className="border border-[#e5e7eb] bg-white p-5 text-center">
            <p className="text-sm text-[#6b7280]">
              Still unsure about your size?{" "}
              <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" className="text-[#3b5f8f] font-semibold hover:underline">
                WhatsApp us
              </a>{" "}
              and our style team will help you find the perfect fit.
            </p>
          </div>
        </FadeIn>

      </div>
    </>
  );
}

function SizeTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] mb-4">
        {title}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-[#e5e7eb] text-sm">
          <thead>
            <tr className="bg-[#1a1a1a] text-white">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  "border-b border-[#e5e7eb] transition-colors",
                  i % 2 === 0 ? "bg-white" : "bg-[#fafaf9]"
                )}
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={cn(
                      "px-4 py-3",
                      j === 0
                        ? "font-bold text-[#1a1a1a] text-center"
                        : "text-[#6b7280]"
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}