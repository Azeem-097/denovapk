"use client";
import { forwardRef, useState, useEffect, useRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ─── FloatingInput ────────────────────────────────────────
interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label:  string;
  error?: string;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, className, id, value, defaultValue, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hasVal, setHasVal]   = useState<boolean>(
      Boolean(value !== undefined ? String(value).length : (defaultValue ? String(defaultValue).length : 0))
    );
    const inputRef = useRef<HTMLInputElement | null>(null);
    const inputId = id || props.name;

    // Sync local hasVal from actual DOM (needed for react-hook-form reset())
    useEffect(() => {
      const el = inputRef.current;
      if (!el) return;
      const check = () => setHasVal(el.value.length > 0);
      check();

      // MutationObserver picks up programmatic value changes
      const observer = new MutationObserver(check);
      observer.observe(el, { attributes: true, attributeFilter: ["value"] });

      // Poll briefly on mount for react-hook-form's reset() timing
      const interval = setInterval(check, 100);
      const timeout = setTimeout(() => clearInterval(interval), 1000);

      return () => {
        observer.disconnect();
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }, [value, defaultValue]);

    // Also react when controlled value changes
    useEffect(() => {
      if (value !== undefined) setHasVal(String(value).length > 0);
    }, [value]);

    const isFloating = focused || hasVal || Boolean(value);

    // Combine external ref with internal ref
    const setRefs = (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
    };

    return (
      <div className="relative">
        <input
          ref={setRefs}
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => {
            setFocused(false);
            setHasVal(e.target.value.length > 0);
            onBlur?.(e);
          }}
          onChange={(e) => {
            setHasVal(e.target.value.length > 0);
            props.onChange?.(e);
          }}
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
            "pointer-events-none absolute left-3.5 transition-all duration-150 bg-white",
            isFloating
              ? "top-1.5 text-[10px] tracking-wide px-0"
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
FloatingInput.displayName = "FloatingInput";


// ─── FloatingTextarea ─────────────────────────────────────
interface FloatingTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label:  string;
  error?: string;
}

export const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ label, error, className, id, value, defaultValue, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hasVal, setHasVal]   = useState<boolean>(
      Boolean(value !== undefined ? String(value).length : (defaultValue ? String(defaultValue).length : 0))
    );
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const inputId = id || props.name;

    useEffect(() => {
      const el = textareaRef.current;
      if (!el) return;
      const check = () => setHasVal(el.value.length > 0);
      check();
      const interval = setInterval(check, 100);
      const timeout = setTimeout(() => clearInterval(interval), 1000);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }, [value, defaultValue]);

    useEffect(() => {
      if (value !== undefined) setHasVal(String(value).length > 0);
    }, [value]);

    const isFloating = focused || hasVal || Boolean(value);

    const setRefs = (el: HTMLTextAreaElement | null) => {
      textareaRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    };

    return (
      <div className="relative">
        <textarea
          ref={setRefs}
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => {
            setFocused(false);
            setHasVal(e.target.value.length > 0);
            onBlur?.(e);
          }}
          onChange={(e) => {
            setHasVal(e.target.value.length > 0);
            props.onChange?.(e);
          }}
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
            "pointer-events-none absolute left-3.5 transition-all duration-150 bg-white",
            isFloating
              ? "top-2 text-[10px] tracking-wide"
              : "top-4 text-sm",
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
FloatingTextarea.displayName = "FloatingTextarea";


// ═══════════════════════════════════════════════════════════
//  FloatingSelect — FIXED: label always floats when value is set
// ═══════════════════════════════════════════════════════════
interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label:   string;
  error?:  string;
  options: { value: string; label: string }[];
}

export const FloatingSelect = forwardRef<HTMLSelectElement, FloatingSelectProps>(
  ({ label, error, className, id, options, value, defaultValue, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [currentVal, setCurrentVal] = useState<string>(
      value !== undefined ? String(value) : (defaultValue !== undefined ? String(defaultValue) : "")
    );
    const selectRef = useRef<HTMLSelectElement | null>(null);
    const inputId = id || props.name;

    // Sync local state from actual DOM value (handles react-hook-form reset)
    useEffect(() => {
      const el = selectRef.current;
      if (!el) return;
      const check = () => setCurrentVal(el.value);
      check();
      const interval = setInterval(check, 100);
      const timeout = setTimeout(() => clearInterval(interval), 1000);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }, [value, defaultValue]);

    useEffect(() => {
      if (value !== undefined) setCurrentVal(String(value));
    }, [value]);

    const isFloating = focused || currentVal.length > 0;

    const setRefs = (el: HTMLSelectElement | null) => {
      selectRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLSelectElement | null>).current = el;
    };

    return (
      <div className="relative">
        <select
          ref={setRefs}
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          onChange={(e) => {
            setCurrentVal(e.target.value);
            props.onChange?.(e);
          }}
          className={cn(
            "peer w-full rounded-md border bg-white px-3.5 pt-5 pb-2 text-sm text-[#1a1a1a] transition-colors duration-150 focus:outline-none appearance-none pr-10",
            !currentVal && "text-transparent",  // Hide the placeholder-like empty option text
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