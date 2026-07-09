"use client";
import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types";

interface Props {
  testimonials: Testimonial[];
}

export function Testimonials({ testimonials }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback((index: number, dir: "left" | "right") => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(dir);
    setCurrent(index);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  const prev = () => { const index = current === 0 ? testimonials.length - 1 : current - 1; goTo(index, "left"); };
  const next = () => { const index = current === testimonials.length - 1 ? 0 : current + 1; goTo(index, "right"); };

  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      const index = current === testimonials.length - 1 ? 0 : current + 1;
      goTo(index, "right");
    }, 5000);
    return () => clearInterval(timer);
  }, [current, goTo, testimonials.length]);

  if (testimonials.length === 0) return null;
  const t = testimonials[current];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#1a1a1a] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <FadeIn><span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">What Our Customers Say</span></FadeIn>
          <TextReveal as="h2" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 block">Loved by Thousands</span>
          </TextReveal>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative min-h-[220px] sm:min-h-[200px]">
            <div key={t.id} className="text-center"
              style={{ animation: isAnimating ? `fadeSlide${direction === "right" ? "Left" : "Right"} 0.5s ease` : "none" }}>
              <div className="flex items-center justify-center gap-1 mb-5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={16} className={cn(i < t.rating ? "text-[#c9a96e] fill-[#c9a96e]" : "text-white/20")} />
                ))}
              </div>
              <p className="font-[family-name:var(--font-cormorant)] text-lg sm:text-xl lg:text-2xl font-light text-white/90 leading-relaxed mb-6 italic">
                &ldquo;{t.comment}&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold text-white tracking-wide">{t.name}</p>
                <p className="text-xs text-white/50 mt-0.5">{t.location}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-5 mt-8">
            <button onClick={prev} className="w-10 h-10 flex items-center justify-center border border-white/20 text-white/60 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-200" aria-label="Previous testimonial">
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => goTo(i, i > current ? "right" : "left")}
                  className={cn("h-1.5 rounded-full transition-all duration-400",
                    i === current ? "w-6 bg-[#c9a96e]" : "w-1.5 bg-white/30 hover:bg-white/50")}
                  aria-label={`Go to testimonial ${i + 1}`} />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 flex items-center justify-center border border-white/20 text-white/60 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-200" aria-label="Next testimonial">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}