"use client";
import { forwardRef, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * FloatingInput — uses pure CSS `:placeholder-shown` to detect empty state.
 * This works reliably with:
 *   - Browser autofill
 *   - react-hook-form's ref-based value setting
 *   - Programmatic value changes
 *   - Manual typing
 *
 * Key trick: the input has a placeholder of " " (single space).
 * When the input is empty, :placeholder-shown is true → label sits inside.
 * When the input has any content, :placeholder-shown is false → label floats.
 */

// ─── FloatingInput ────────────────────────────────────────
interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label:  string;
  error?: string;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, className, id, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || props.name;

    return (
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          className={cn(
            "peer w-full rounded-md border bg-white px-3.5 pt-5 pb-2 text-sm text-[#1a1a1a] transition-colors duration-150 focus:outline-none",
            error
              ? "border-red-400 focus:border-red-500"
              : "border-[#d1d5db] focus:border-[#1a1a1a]",
            className
          )}
          placeholder=" "
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-3.5 bg-white transition-all duration-150",
            // Base float position (used when input has value OR is focused)
            "top-1.5 text-[10px] tracking-wide px-0",
            // Move DOWN to inside the input when: not focused AND placeholder shown (empty)
            !focused && "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm",
            error ? "text-red-500" : (focused ? "text-[#6b7280]" : "text-[#9ca3af] peer-[:not(:placeholder-shown)]:text-[#6b7280]")
          )}
        >
          {label}
        </label>
        {error && (
          <p className="mt-1 text-[11px] text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";


// ─── FloatingTextarea ─────────────────────────────────────
interface FloatingTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label:  string;
  error?: string;
}

export const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ label, error, className, id, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || props.name;

    return (
      <div className="relative">
        <textarea
          ref={ref}
          id={inputId}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          className={cn(
            "peer w-full rounded-md border bg-white px-3.5 pt-6 pb-2.5 text-sm text-[#1a1a1a] transition-colors duration-150 focus:outline-none resize-y min-h-[90px]",
            error
              ? "border-red-400 focus:border-red-500"
              : "border-[#d1d5db] focus:border-[#1a1a1a]",
            className
          )}
          placeholder=" "
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-3.5 bg-white transition-all duration-150",
            "top-2 text-[10px] tracking-wide",
            !focused && "peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm",
            error ? "text-red-500" : (focused ? "text-[#6b7280]" : "text-[#9ca3af] peer-[:not(:placeholder-shown)]:text-[#6b7280]")
          )}
        >
          {label}
        </label>
        {error && (
          <p className="mt-1 text-[11px] text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
FloatingTextarea.displayName = "FloatingTextarea";


// ═══════════════════════════════════════════════════════════
//  FloatingSelect — for select we still need JS since
//  :placeholder-shown does not apply to <select>
// ═══════════════════════════════════════════════════════════
interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label:   string;
  error?:  string;
  options: { value: string; label: string }[];
}

export const FloatingSelect = forwardRef<HTMLSelectElement, FloatingSelectProps>(
  ({ label, error, className, id, options, value, defaultValue, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    // For select, we watch attribute changes via the parent's value/defaultValue
    // AND we use a data attribute to flag if the visual value is present
    const inputId = id || props.name;

    // Determine if select has a value (works for both controlled + uncontrolled)
    const hasValue = value !== undefined
      ? String(value).length > 0
      : defaultValue !== undefined
        ? String(defaultValue).length > 0
        : false;

    const isFloating = focused || hasValue;

    return (
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          className={cn(
            "peer w-full rounded-md border bg-white px-3.5 pt-5 pb-2 text-sm text-[#1a1a1a] transition-colors duration-150 focus:outline-none appearance-none pr-10",
            !hasValue && !focused && "text-transparent",
            error
              ? "border-red-400 focus:border-red-500"
              : "border-[#d1d5db] focus:border-[#1a1a1a]",
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-[#1a1a1a]">
              {opt.label}
            </option>
          ))}
        </select>
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-3.5 transition-all duration-150 bg-white",
            isFloating
              ? "top-1.5 text-[10px] tracking-wide"
              : "top-1/2 -translate-y-1/2 text-sm",
            error ? "text-red-500" : (isFloating ? "text-[#6b7280]" : "text-[#9ca3af]")
          )}
        >
          {label}
        </label>
        {error && (
          <p className="mt-1 text-[11px] text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
FloatingSelect.displayName = "FloatingSelect";


// ═══════════════════════════════════════════════════════════
//  FloatingLockedField — visual match for read-only "Pakistan"
// ═══════════════════════════════════════════════════════════
interface FloatingLockedFieldProps {
  label: string;
  value: string;
}
export function FloatingLockedField({ label, value }: FloatingLockedFieldProps) {
  return (
    <div className="relative">
      <div className="w-full rounded-md border border-[#d1d5db] bg-[#fafaf9] px-3.5 pt-5 pb-2 text-sm text-[#1a1a1a]">
        {value}
      </div>
      <span className="pointer-events-none absolute left-3.5 top-1.5 text-[10px] tracking-wide text-[#6b7280] bg-[#fafaf9] px-0">
        {label}
      </span>
    </div>
  );
}