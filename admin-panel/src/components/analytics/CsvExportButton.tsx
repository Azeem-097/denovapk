"use client";
import { Download } from "lucide-react";

interface Props<T extends Record<string, unknown>> {
  filename: string;
  rows:     T[];
  columns:  Array<{ key: keyof T; label: string; format?: (v: T[keyof T]) => string }>;
  label?:   string;
}

function escapeCsvValue(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function CsvExportButton<T extends Record<string, unknown>>({
  filename, rows, columns, label = "Export CSV",
}: Props<T>) {
  const handleClick = () => {
    if (rows.length === 0) return;

    const header = columns.map((c) => escapeCsvValue(c.label)).join(",");
    const body   = rows.map((row) =>
      columns.map((c) => {
        const raw = row[c.key];
        return escapeCsvValue(c.format ? c.format(raw) : raw);
      }).join(",")
    ).join("\n");

    const csv  = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleClick}
      disabled={rows.length === 0}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E10600] hover:text-[#B80000] disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Download size={12} />
      {label}
    </button>
  );
}