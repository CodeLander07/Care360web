/**
 * rPPG Web Worker - Offloads signal processing from main thread
 * Receives luma series, returns health report
 */
const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;

function detrendRollingAverage(signal, fps) {
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

function lowPassFilter(signal, fps, cutoffHz = 4) {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / fps;
  const alpha = dt / (rc + dt);
  const result = [];
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

function normalizeSignal(signal) {
  const min = Math.min(...signal);
  const max = Math.max(...signal);
  const range = max - min || 1;
  return signal.map((v) => (v - min) / range);
}

function findBeatCandidates(signal, fps, maxBpm = 120, minBpm = 40) {
  const minGap = Math.floor((60 * fps) / maxBpm);
  const minima = [];
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

function filterBeats(minima, signal, fps) {
  const valid = [];
  const rejected = [];
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

function computeHeartRate(validMinima, fps) {
  if (validMinima.length < 2) {
    return { avgBpm: 0, instantaneousBpm: [], variability: 0 };
  }
  const instantaneousBpm = [];
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

function estimateSignalQuality(signal, validBeats, avgBpm, variability) {
  if (validBeats.length < 5) return 0;
  const consistencyScore = Math.max(0, 1 - variability / 15);
  const beatDensity = validBeats.length / (signal.length / 30);
  const densityScore = Math.min(1, beatDensity / 2);
  const bpmInRange = avgBpm >= 50 && avgBpm <= 100 ? 1 : 0.7;
  return consistencyScore * 0.5 + densityScore * 0.3 + bpmInRange * 0.2;
}

function deriveConfidence(quality, beatsAnalyzed) {
  if (quality >= 0.8 && beatsAnalyzed >= 15) return "High";
  if (quality >= 0.6 && beatsAnalyzed >= 8) return "Medium";
  return "Low";
}

self.onmessage = function (e) {
  const { lumaSeries, fps } = e.data;
  const detrended = detrendRollingAverage(lumaSeries, fps);
  const filtered = lowPassFilter(detrended, fps, 4);
  const normalized = normalizeSignal(filtered);
  const minima = findBeatCandidates(normalized, fps);
  const { valid, rejected } = filterBeats(minima, normalized, fps);
  const { avgBpm, instantaneousBpm, variability } = computeHeartRate(
    valid,
    fps
  );
  const quality = estimateSignalQuality(normalized, valid, avgBpm, variability);
  const confidence = deriveConfidence(quality, valid.length);
  const riskFlags = [];
  if (avgBpm > 100) riskFlags.push("elevated_heart_rate");
  if (avgBpm < 50) riskFlags.push("low_heart_rate");
  if (variability > 15) riskFlags.push("high_variability");
  const report = {
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
    processedSignal: normalized,
  };
  self.postMessage({ type: "result", report });
};
