"use client";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface Props {
  data: Array<{ status: string; count: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "#eab308",
  confirmed:  "#3b82f6",
  processing: "#f97316",
  shipped:    "#6366f1",
  delivered:  "#22c55e",
  cancelled:  "#ef4444",
  refunded:   "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
  refunded:   "Refunded",
};

export function StatusDonut({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[240px] text-sm text-[#6b7280]">
        No orders in this period.
      </div>
    );
  }

  const enriched = data.map((d) => ({
    ...d,
    label: STATUS_LABELS[d.status] ?? d.status,
    color: STATUS_COLORS[d.status] ?? "#9ca3af",
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4 items-center">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={enriched}
            dataKey="count"
            nameKey="label"
            cx="50%" cy="50%"
            innerRadius={45}
            outerRadius={72}
            paddingAngle={2}
            strokeWidth={0}
          >
            {enriched.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#1a1a1a", border: "none", borderRadius: 4,
              fontSize: 12, color: "#fff",
            }}
            formatter={(value, name) => {
              const num = typeof value === "number" ? value : Number(value) || 0;
              return [`${num} order${num === 1 ? "" : "s"}`, String(name ?? "")];
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-2">
        {enriched.map((d) => {
          const pct = ((d.count / total) * 100).toFixed(1);
          return (
            <div key={d.status} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-[#1a1a1a] font-medium capitalize flex-1">{d.label}</span>
              <span className="text-[#6b7280]">{d.count} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}