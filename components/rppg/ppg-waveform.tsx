"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface PpgWaveformProps {
  signal: number[];
  fps?: number;
}

export function PpgWaveform({ signal, fps = 30 }: PpgWaveformProps) {
  const data = useMemo(() => {
    const step = Math.max(1, Math.floor(signal.length / 200));
    return signal
      .filter((_, i) => i % step === 0)
      .map((v, i) => ({
        time: (i * step) / fps,
        value: v,
      }));
  }, [signal, fps]);

  if (!signal.length) return null;

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id="ppgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            hide
            type="number"
            domain={["dataMin", "dataMax"]}
          />
          <YAxis hide domain={[0, 1]} />
          <Tooltip
            contentStyle={{
              background: "rgba(15,36,53,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
            formatter={(value) => [Number(value ?? 0).toFixed(3), "Amplitude"]}
            labelFormatter={(time) => `Time: ${Number(time ?? 0).toFixed(1)}s`}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#0d9488"
            strokeWidth={1.5}
            fill="url(#ppgGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
