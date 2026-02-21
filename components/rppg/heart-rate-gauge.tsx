"use client";

interface HeartRateGaugeProps {
  bpm: number;
  confidence?: "High" | "Medium" | "Low";
}

export function HeartRateGauge({ bpm, confidence = "Medium" }: HeartRateGaugeProps) {
  const normalized = Math.min(200, Math.max(40, bpm));
  const rotation = ((normalized - 40) / 160) * 180 - 90;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="rgba(13,148,136,0.6)"
            strokeWidth="8"
            strokeDasharray={`${(rotation + 90) / 180 * 326} 326`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-text-primary">{bpm || "--"}</span>
          <span className="text-xs text-text-muted">BPM</span>
          <span
            className={`mt-1 text-xs ${
              confidence === "High"
                ? "text-success"
                : confidence === "Medium"
                  ? "text-warning"
                  : "text-error"
            }`}
          >
            {confidence} confidence
          </span>
        </div>
      </div>
    </div>
  );
}
