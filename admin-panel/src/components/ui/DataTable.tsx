"use client";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TableColumn, SortConfig } from "@/types";

interface DataTableProps<T> {
  columns:      TableColumn<T>[];
  data:         T[];
  keyField:     keyof T;
  isLoading?:   boolean;
  emptyMessage?: string;
  onRowClick?:  (row: T) => void;
  className?:   string;
}

export function DataTable<T>({
  columns, data, keyField,
  isLoading = false, emptyMessage = "No data found",
  onRowClick, className,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortConfig | null>(null);

  const handleSort = (col: TableColumn<T>) => {
    if (!col.sortable) return;
    const key = col.key as string;
    if (sort?.key === key) {
      setSort({ key, direction: sort.direction === "asc" ? "desc" : "asc" });
    } else {
      setSort({ key, direction: "asc" });
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sort) return 0;
    const av = (a as Record<string, unknown>)[sort.key];
    const bv = (b as Record<string, unknown>)[sort.key];
    if (av === bv) return 0;
    const cmp = String(av) < String(bv) ? -1 : 1;
    return sort.direction === "asc" ? cmp : -cmp;
  });

  if (isLoading) {
    return (
      <div className="bg-white border border-[#e5e7eb] overflow-hidden">
        <div className="divide-y divide-[#e5e7eb]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex gap-4">
              {columns.map((_, j) => (
                <div key={j} className="h-4 bg-[#e5e7eb] rounded animate-pulse flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white border border-[#e5e7eb] overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafaf9]">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => handleSort(col)}
                  className={cn(
                    "px-4 py-3 text-left text-[11px] font-semibold tracking-[0.1em] uppercase text-[#6b7280] whitespace-nowrap",
                    col.sortable && "cursor-pointer hover:text-[#1a1a1a] select-none",
                    col.width && `w-${col.width}`
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <div className="flex flex-col opacity-40">
                        <ChevronUp size={10} className={sort?.key === col.key && sort.direction === "asc" ? "opacity-100 text-[#3b5f8f]" : ""} />
                        <ChevronDown size={10} className={cn("-mt-1", sort?.key === col.key && sort.direction === "desc" ? "opacity-100 text-[#3b5f8f]" : "")} />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-[#6b7280]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr
                  key={String(row[keyField])}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "hover:bg-[#fafaf9] transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3.5 text-[#1a1a1a] whitespace-nowrap">
                      {col.render
                        ? col.render(
                            (row as Record<string, unknown>)[col.key as string],
                            row
                          )
                        : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}