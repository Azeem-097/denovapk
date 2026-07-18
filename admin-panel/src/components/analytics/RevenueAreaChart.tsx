"use client";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { formatPaisa } from "@/lib/priceUtils";

interface Point {
  date:    string;
  revenue: number;   // paisa
  orders:  number;
}

interface Props {
  data:    Point[];
  height?: number;
}

export function RevenueAreaChart({ data, height = 260 }: Props) {
  // Convert paisa to rupees for display; keep raw for tooltip
  const chartData = data.map((d) => ({
    ...d,
    revenueRupees: d.revenue / 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#c9a96e" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#c9a96e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => {
            if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
            if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K`;
            return v.toString();
          }}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a1a",
            border:     "none",
            borderRadius: 4,
            fontSize:   12,
            color:      "#fff",
          }}
          labelStyle={{ color: "#c9a96e", fontWeight: 600 }}
          formatter={(value, name) => {
            const num = typeof value === "number" ? value : Number(value) || 0;
            if (name === "revenueRupees") return [formatPaisa(num * 100), "Revenue"];
            return [String(value ?? ""), String(name ?? "")];
          }}
        />
        <Area
          type="monotone"
          dataKey="revenueRupees"
          stroke="#c9a96e"
          strokeWidth={2}
          fill="url(#goldFill)"
          activeDot={{ r: 5, fill: "#c9a96e", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}