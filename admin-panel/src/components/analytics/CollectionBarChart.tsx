"use client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatPaisa } from "@/lib/priceUtils";

interface Props {
  data: Array<{ collectionName: string; revenue: number; units: number }>;
}

export function CollectionBarChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[240px] text-sm text-[#6b7280]">
        No sales in this period.
      </div>
    );
  }

  const chartData = [...data]
    .sort((a, b) => a.revenue - b.revenue)
    .map((d) => ({
      name:          d.collectionName,
      revenueRupees: d.revenue / 100,
      units:         d.units,
    }));

  const height = Math.max(200, chartData.length * 42);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
          tickFormatter={(v) => {
            if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
            if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K`;
            return v.toString();
          }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "#1a1a1a" }}
          tickLine={false}
          axisLine={false}
          width={130}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a1a", border: "none", borderRadius: 4,
            fontSize: 12, color: "#fff",
          }}
          formatter={(value, _name, entry) => {
            const num = typeof value === "number" ? value : Number(value) || 0;
            const rec = (entry?.payload ?? {}) as { units?: number };
            const units = rec.units ?? 0;
            return [`${formatPaisa(num * 100)} (${units} units)`, "Revenue"];
          }}
        />
        <Bar dataKey="revenueRupees" fill="#3b5f8f" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}