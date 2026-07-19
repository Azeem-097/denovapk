import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ─── Input ────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:     string;
  error?:     string;
  hint?:      string;
  required?:  boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium tracking-wide text-[#1a1a1a] mb-1.5"
          >
            {label}
            {required && <span className="text-[#3b5f8f] ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3.5 py-3 text-sm text-[#1a1a1a] bg-white border transition-colors duration-150 placeholder:text-[#6b7280]/60 focus:outline-none",
            error
              ? "border-red-400 focus:border-red-500"
              : "border-[#e5e7eb] focus:border-[#3b5f8f]",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1 text-[11px] text-[#6b7280]">{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-[11px] text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// ─── Textarea ──────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:     string;
  error?:     string;
  hint?:      string;
  required?:  boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium tracking-wide text-[#1a1a1a] mb-1.5"
          >
            {label}
            {required && <span className="text-[#3b5f8f] ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3.5 py-3 text-sm text-[#1a1a1a] bg-white border transition-colors duration-150 placeholder:text-[#6b7280]/60 focus:outline-none resize-y min-h-[100px]",
            error
              ? "border-red-400 focus:border-red-500"
              : "border-[#e5e7eb] focus:border-[#3b5f8f]",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1 text-[11px] text-[#6b7280]">{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-[11px] text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// ─── Select ────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:     string;
  error?:     string;
  required?:  boolean;
  options:    { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, required, className, id, options, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium tracking-wide text-[#1a1a1a] mb-1.5"
          >
            {label}
            {required && <span className="text-[#3b5f8f] ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3.5 py-3 text-sm text-[#1a1a1a] bg-white border transition-colors duration-150 focus:outline-none appearance-none bg-no-repeat bg-right pr-10",
            error
              ? "border-red-400 focus:border-red-500"
              : "border-[#e5e7eb] focus:border-[#3b5f8f]",
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5'/%3E%3C/svg%3E")`,
            backgroundPosition: "right 14px center",
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-[11px] text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";