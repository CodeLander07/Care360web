/**
 * rPPG Heart Rate Analysis Types
 * Based on: Lovisotto et al., "Seeing Red: PPG Biometrics Using Smartphone Cameras", CVPRW 2020
 */

export interface RppgHealthReport {
  avgHeartRate: number;
  restingHeartRate: number;
  confidence: "High" | "Medium" | "Low";
  signalQuality: number;
  beatsAnalyzed: number;
  instantaneousBpm: number[];
  bpmVariability: number;
  riskFlags: string[];
  timestamp: string;
  fps: number;
  durationSeconds: number;
}

export interface BeatCandidate {
  index: number;
  timestamp: number;
  bpm: number;
  rejected: boolean;
  reason?: string;
}

export interface ProcessingState {
  phase: "idle" | "capturing" | "processing" | "complete" | "error";
  progress: number;
  framesCaptured: number;
  signalStrength: number;
  motionDetected: boolean;
  message?: string;
}
