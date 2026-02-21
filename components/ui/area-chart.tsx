"use client";

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface AreaChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface AreaChartProps {
  data: AreaChartDataPoint[];
  dataKey?: string;
  strokeColor?: string;
  height?: number;
  className?: string;
}

const defaultStroke = "#0d9488";

export function AreaChart({
  data,
  dataKey = "value",
  strokeColor = defaultStroke,
  height = 280,
  className,
}: AreaChartProps) {
  return (
    <div className={className} style={{ width: "100%", minWidth: 0, minHeight: height, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toString()}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(26, 51, 71, 0.95)",
              border: "1px solid rgba(232, 242, 248, 0.12)",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
            labelStyle={{ color: "#94a3b8", fontSize: 12 }}
            itemStyle={{ color: "#f8fafc" }}
            cursor={{ stroke: "#64748b", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={2}
            fill="url(#areaFill)"
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
