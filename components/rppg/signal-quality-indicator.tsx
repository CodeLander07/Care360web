"use client";

interface SignalQualityIndicatorProps {
  quality: number;
  beatsAnalyzed: number;
}

export function SignalQualityIndicator({ quality, beatsAnalyzed }: SignalQualityIndicatorProps) {
  const level =
    quality >= 0.8 ? "High" : quality >= 0.6 ? "Medium" : "Low";
  const color =
    level === "High"
      ? "text-success"
      : level === "Medium"
        ? "text-warning"
        : "text-error";

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="mb-1 flex justify-between text-xs text-text-muted">
          <span>Signal quality</span>
          <span className={color}>{Math.round(quality * 100)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-teal transition-all duration-500"
            style={{ width: `${quality * 100}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-text-muted">
        {beatsAnalyzed} beats
      </span>
    </div>
  );
}
