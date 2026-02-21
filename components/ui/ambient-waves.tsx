"use client";

/**
 * Ambient wave background - concentric arcs radiating from center.
 * Soft medium blue arcs with blurred edges, subtle star dots.
 * Matches reference: ethereal, depth, calm enterprise aesthetic.
 */
export function AmbientWaves() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      aria-hidden
    >
      {/* Subtle scattered dots (distant stars) */}
      <div className="absolute inset-0">
        {[12, 28, 45, 67, 82, 15, 35, 58, 72, 88, 22, 41, 63, 78].map(
          (x, i) => (
            <div
              key={i}
              className="absolute h-px w-px rounded-full bg-blue-200/30"
              style={{
                left: `${x}%`,
                top: `${(i * 7 + 18) % 70}%`,
                boxShadow: "0 0 2px rgba(191, 219, 254, 0.4)",
              }}
            />
          )
        )}
      </div>

      {/* Concentric arc waves - soft blue, blurred edges */}
      <svg
        className="h-full w-full max-h-[min(100vh,900px)] max-w-[min(100vw,1400px)] animate-ambient-pulse"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="wave-grad-1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(96, 165, 250, 0.15)" />
            <stop offset="30%" stopColor="rgba(59, 130, 246, 0.08)" />
            <stop offset="60%" stopColor="rgba(147, 197, 253, 0.03)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="wave-grad-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.12)" />
            <stop offset="40%" stopColor="rgba(96, 165, 250, 0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="wave-grad-3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(37, 99, 235, 0.1)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.03)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          {/* Arc strokes - soft glow */}
          <filter id="wave-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
          </filter>
          <filter id="stroke-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>
        {/* Filled radial gradients - soft luminosity */}
        <circle
          cx="400"
          cy="320"
          r="340"
          fill="url(#wave-grad-1)"
          filter="url(#wave-blur)"
        />
        <circle
          cx="400"
          cy="320"
          r="250"
          fill="url(#wave-grad-2)"
          filter="url(#wave-blur)"
        />
        <circle cx="400" cy="320" r="180" fill="url(#wave-grad-3)" />
        {/* Concentric arc rings - soft stroke glow */}
        {[120, 180, 240, 300].map((r, i) => (
          <circle
            key={r}
            cx="400"
            cy="320"
            r={r}
            fill="none"
            stroke="rgba(96, 165, 250, 0.08)"
            strokeWidth={2}
            filter="url(#stroke-blur)"
            style={{ opacity: 1 - i * 0.15 }}
          />
        ))}
      </svg>
    </div>
  );
}
