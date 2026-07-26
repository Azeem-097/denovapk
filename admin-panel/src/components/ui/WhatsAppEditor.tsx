"use client";
import { useState, useRef, useEffect } from "react";
import { Bold, Italic, Strikethrough, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppEditorProps {
  value: string;
  onChange: (value: string) => void;
  variables: string[];
}

export function WhatsAppEditor({ value, onChange, variables }: WhatsAppEditorProps) {
  const [internalValue, setInternalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showVars, setShowVars] = useState(false);

  // Sync prop to internal state if changed externally
  useEffect(() => {
    if (value !== internalValue) setInternalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalValue(e.target.value);
    onChange(e.target.value);
  };

  const insertSyntax = (syntax: string) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const text  = internalValue;

    // If text selected, wrap it. Else insert syntax around cursor.
    const selected = text.slice(start, end);
    const before   = text.slice(0, start);
    const after    = text.slice(end);

    let newVal = "";
    if (selected) {
      newVal = `${before}${syntax}${selected}${syntax}${after}`;
    } else {
      newVal = `${before}${syntax}text${syntax}${after}`;
    }

    setInternalValue(newVal);
    onChange(newVal);

    // Refocus and restore cursor
    setTimeout(() => {
      el.focus();
      const newCursor = selected ? start + syntax.length + selected.length + syntax.length : start + syntax.length + 4;
      el.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const insertVariable = (variable: string) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const text  = internalValue;
    const before = text.slice(0, start);
    const after  = text.slice(start);

    const newVal = `${before}{{${variable}}}${after}`;
    setInternalValue(newVal);
    onChange(newVal);
    setShowVars(false);

    setTimeout(() => {
      el.focus();
      const newCursor = start + variable.length + 4;
      el.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  return (
    <div className="border border-[#e5e7eb] rounded-md bg-white overflow-hidden focus-within:border-[#E10600] focus-within:ring-1 focus-within:ring-[#E10600]/20 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-[#e5e7eb] bg-[#fafaf9] px-2 py-1.5">
        <button type="button" onClick={() => insertSyntax("*")} className="p-1.5 text-[#6b7280] hover:text-[#1a1a1a] hover:bg-[#e5e7eb] rounded transition-colors" title="Bold (*text*)">
          <Bold size={16} />
        </button>
        <button type="button" onClick={() => insertSyntax("_")} className="p-1.5 text-[#6b7280] hover:text-[#1a1a1a] hover:bg-[#e5e7eb] rounded transition-colors" title="Italic (_text_)">
          <Italic size={16} />
        </button>
        <button type="button" onClick={() => insertSyntax("~")} className="p-1.5 text-[#6b7280] hover:text-[#1a1a1a] hover:bg-[#e5e7eb] rounded transition-colors" title="Strikethrough (~text~)">
          <Strikethrough size={16} />
        </button>

        <div className="w-px h-5 bg-[#e5e7eb] mx-1" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowVars(!showVars)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold tracking-wide uppercase text-[#6b7280] hover:text-[#1a1a1a] hover:bg-[#e5e7eb] rounded transition-colors"
          >
            <PlusCircle size={14} /> Variables
          </button>
          
          {showVars && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowVars(false)} />
              <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-[#e5e7eb] shadow-xl z-20 rounded-md overflow-hidden py-1">
                {variables.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="w-full text-left px-3 py-2 text-xs font-mono text-[#1a1a1a] hover:bg-[#fafaf9] transition-colors"
                  >
                    {`{{${v}}}`}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <textarea
        ref={textareaRef}
        value={internalValue}
        onChange={handleChange}
        className="w-full min-h-[280px] p-4 text-sm text-[#1a1a1a] focus:outline-none resize-y"
        placeholder="Type your WhatsApp message here. Use *asterisks* for bold, _underscores_ for italic."
      />
    </div>
  );
}