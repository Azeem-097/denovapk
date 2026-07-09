"use client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1, label: "Information" },
  { num: 2, label: "Shipping" },
  { num: 3, label: "Payment" },
  { num: 4, label: "Review" },
];

interface CheckoutStepsProps {
  currentStep: number;
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {STEPS.map((step, i) => {
          const isDone   = currentStep > step.num;
          const isActive = currentStep === step.num;

          return (
            <div key={step.num} className="flex items-center flex-1">
              {/* Circle */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 flex-shrink-0",
                    isDone   && "bg-[#c9a96e] text-white",
                    isActive && "bg-[#1a1a1a] text-white ring-4 ring-[#1a1a1a]/10",
                    !isDone && !isActive && "bg-[#f5f0e8] text-[#6b7280] border border-[#e5e7eb]"
                  )}
                >
                  {isDone ? <Check size={14} /> : step.num}
                </div>
                <span
                  className={cn(
                    "mt-2 text-[10px] sm:text-xs font-medium tracking-wide whitespace-nowrap",
                    (isDone || isActive) ? "text-[#1a1a1a]" : "text-[#6b7280]"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Line between */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-2 sm:mx-3 -mt-5 relative">
                  <div className="absolute inset-0 bg-[#e5e7eb]" />
                  <div
                    className={cn(
                      "absolute inset-0 bg-[#c9a96e] transition-all duration-500 origin-left",
                      isDone ? "scale-x-100" : "scale-x-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}