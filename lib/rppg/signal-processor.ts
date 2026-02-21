/**
 * rPPG Signal Processing Pipeline
 * Based on: Lovisotto et al., "Seeing Red: PPG Biometrics Using Smartphone Cameras", CVPRW 2020
 * - Eq.1: Luma Y = 0.299*R + 0.587*G + 0.114*B
 * - Section 4.2: Rolling average detrending, low-pass filter
 * - Algorithm 1: Beat separation with min inter-beat gap
 * - Section 4.5: Beat quality filtering (BPM>120, peaks, DTW)
 */

const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;

/** Extract mean luma per frame from RGB frame data (Eq.1) */
export function extractLumaFromFrame(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number {
  let sum = 0;
  const len = width * height * 4;
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    sum += LUMA_R * r + LUMA_G * g + LUMA_B * b;
  }
  return sum / (width * height);
}

/** Rolling average detrending (1 second window, paper Section 4.2) */
export function detrendRollingAverage(signal: number[], fps: number): number[] {
  const windowSize = Math.round(fps);
  const result = new Array(signal.length).fill(0);
  const half = Math.floor(windowSize / 2);
  for (let i = 0; i < signal.length; i++) {
    const start = Math.max(0, i - half);
    const end = Math.min(signal.length, i + half + 1);
    let sum = 0;
    for (let j = start; j < end; j++) sum += signal[j];
    result[i] = signal[i] - sum / (end - start);
  }
  return result;
}

/** Low-pass filter, cutoff 4 Hz (~240 BPM), 2nd-order Butterworth approximation */
export function lowPassFilter(
  signal: number[],
  fps: number,
  cutoffHz = 4
): number[] {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / fps;
  const alpha = dt / (rc + dt);
  const result: number[] = [];
  let y1 = signal[0];
  let y2 = signal[0];
  for (let i = 0; i < signal.length; i++) {
    const x = signal[i];
    y1 = alpha * x + (1 - alpha) * y1;
    y2 = alpha * y1 + (1 - alpha) * y2;
    result.push(y2);
  }
  return result;
}

/** Normalize signal to [0, 1] amplitude */
export function normalizeSignal(signal: number[]): number[] {
  const min = Math.min(...signal);
  const max = Math.max(...signal);
  const range = max - min || 1;
  return signal.map((v) => (v - min) / range);
}

/** Find local minima in smoothed signal (Algorithm 1 - Beat Separation) */
export function findBeatCandidates(
  signal: number[],
  fps: number,
  maxBpm = 120,
  minBpm = 40
): number[] {
  const minGap = Math.floor((60 * fps) / maxBpm);
  const maxGap = Math.ceil((60 * fps) / minBpm);
  const minima: number[] = [];
  const window = Math.max(3, Math.floor(minGap / 2));
  for (let i = window; i < signal.length - window; i++) {
    let isMin = true;
    for (let j = -window; j <= window; j++) {
      if (j !== 0 && signal[i + j] <= signal[i]) {
        isMin = false;
        break;
      }
    }
    if (!isMin) continue;
    const lastMin = minima[minima.length - 1];
    if (minima.length === 0 || i - lastMin >= minGap) {
      minima.push(i);
    } else if (signal[i] < signal[lastMin]) {
      minima[minima.length - 1] = i;
    }
  }
  return minima;
}

/** Quality filter: reject BPM>120, irregular beats (simplified DTW / peak consistency) */
export function filterBeats(
  minima: number[],
  signal: number[],
  fps: number
): { valid: number[]; rejected: number[] } {
  const valid: number[] = [];
  const rejected: number[] = [];
  if (minima.length < 3) {
    rejected.push(...minima);
    return { valid, rejected };
  }
  const bpmValues = minima.slice(1).map((_, i) => {
    const gap = (minima[i + 1] - minima[i]) / fps;
    return 60 / gap;
  });
  const medianBpm =
    bpmValues.length > 0
      ? bpmValues.slice().sort((a, b) => a - b)[Math.floor(bpmValues.length / 2)]
      : 72;
  for (let i = 0; i < minima.length; i++) {
    let bpm = 72;
    if (i > 0 && i < minima.length - 1) {
      const gap = (minima[i + 1] - minima[i - 1]) / (2 * fps);
      bpm = 60 / gap;
    }
    if (bpm > 120) {
      rejected.push(minima[i]);
      continue;
    }
    if (Math.abs(bpm - medianBpm) > 30) {
      rejected.push(minima[i]);
      continue;
    }
    valid.push(minima[i]);
  }
  return { valid, rejected };
}

/** Compute average BPM and variability from valid beats */
export function computeHeartRate(
  validMinima: number[],
  fps: number
): {
  avgBpm: number;
  instantaneousBpm: number[];
  variability: number;
} {
  if (validMinima.length < 2) {
    return { avgBpm: 0, instantaneousBpm: [], variability: 0 };
  }
  const instantaneousBpm: number[] = [];
  for (let i = 1; i < validMinima.length; i++) {
    const gap = (validMinima[i] - validMinima[i - 1]) / fps;
    instantaneousBpm.push(60 / gap);
  }
  const avgBpm =
    instantaneousBpm.reduce((a, b) => a + b, 0) / instantaneousBpm.length;
  const variance =
    instantaneousBpm.reduce((s, b) => s + (b - avgBpm) ** 2, 0) /
    instantaneousBpm.length;
  const variability = Math.sqrt(variance);
  return { avgBpm, instantaneousBpm, variability };
}

/** Estimate signal quality from signal regularity and beat consistency */
export function estimateSignalQuality(
  signal: number[],
  validBeats: number[],
  avgBpm: number,
  variability: number
): number {
  if (validBeats.length < 5) return 0;
  const consistencyScore = Math.max(0, 1 - variability / 15);
  const beatDensity = validBeats.length / (signal.length / 30);
  const densityScore = Math.min(1, beatDensity / 2);
  const bpmInRange = avgBpm >= 50 && avgBpm <= 100 ? 1 : 0.7;
  return (consistencyScore * 0.5 + densityScore * 0.3 + bpmInRange * 0.2);
}

/** Derive confidence from quality and beat count */
export function deriveConfidence(
  quality: number,
  beatsAnalyzed: number
): "High" | "Medium" | "Low" {
  if (quality >= 0.8 && beatsAnalyzed >= 15) return "High";
  if (quality >= 0.6 && beatsAnalyzed >= 8) return "Medium";
  return "Low";
}

import type { RppgHealthReport } from "./types";

/** Full pipeline: raw luma signal -> report */
export function processLumaSignal(
  lumaSeries: number[],
  fps: number
): RppgHealthReport {
  const detrended = detrendRollingAverage(lumaSeries, fps);
  const filtered = lowPassFilter(detrended, fps, 4);
  const normalized = normalizeSignal(filtered);
  const minima = findBeatCandidates(normalized, fps);
  const { valid, rejected } = filterBeats(minima, normalized, fps);
  const { avgBpm, instantaneousBpm, variability } = computeHeartRate(
    valid,
    fps
  );
  const quality = estimateSignalQuality(
    normalized,
    valid,
    avgBpm,
    variability
  );
  const confidence = deriveConfidence(quality, valid.length);
  const riskFlags: string[] = [];
  if (avgBpm > 100) riskFlags.push("elevated_heart_rate");
  if (avgBpm < 50) riskFlags.push("low_heart_rate");
  if (variability > 15) riskFlags.push("high_variability");
  return {
    avgHeartRate: Math.round(avgBpm),
    restingHeartRate: Math.round(avgBpm),
    confidence,
    signalQuality: Math.round(quality * 100) / 100,
    beatsAnalyzed: valid.length,
    instantaneousBpm,
    bpmVariability: Math.round(variability * 10) / 10,
    riskFlags,
    timestamp: new Date().toISOString(),
    fps,
    durationSeconds: lumaSeries.length / fps,
  };
}
