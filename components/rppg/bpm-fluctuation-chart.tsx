"use client";

import { useMemo, useId } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface BpmFluctuationChartProps {
  instantaneousBpm: number[];
  avgBpm: number;
  fps?: number;
}

/** Oximeter-style BPM fluctuation chart (beat-to-beat heart rate over time) */
export function BpmFluctuationChart({
  instantaneousBpm,
  avgBpm,
  fps = 30,
}: BpmFluctuationChartProps) {
  const gradId = useId().replace(/:/g, "-");
  const data = useMemo(() => {
    if (!instantaneousBpm?.length) return [];
    const beatInterval = 60 / avgBpm;
    return instantaneousBpm.map((bpm, i) => ({
      beat: i + 1,
      time: (i * beatInterval).toFixed(1),
      bpm: Math.round(bpm),
    }));
  }, [instantaneousBpm, avgBpm]);

  if (!data.length) return null;

  const yMin = Math.max(40, Math.min(...data.map((d) => d.bpm)) - 5);
  const yMax = Math.min(120, Math.max(...data.map((d) => d.bpm)) + 5);

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            type="category"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
            tickFormatter={(v) => `${v}s`}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
            tickFormatter={(v) => `${v}`}
            width={28}
          />
          <ReferenceLine y={avgBpm} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{
              background: "rgba(15,36,53,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
            formatter={(value) => [value ?? "—", "BPM"]}
            labelFormatter={(_, payload) =>
              payload?.[0] ? `Beat ${payload[0].payload.beat}` : ""
            }
          />
          <Area
            type="monotone"
            dataKey="bpm"
            stroke="#ef4444"
            strokeWidth={2}
            fill={`url(#${gradId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
