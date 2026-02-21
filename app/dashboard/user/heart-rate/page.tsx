"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { CameraCapture } from "@/components/rppg/camera-capture";
import { HeartRateGauge } from "@/components/rppg/heart-rate-gauge";
import { PpgWaveform } from "@/components/rppg/ppg-waveform";
import { SignalQualityIndicator } from "@/components/rppg/signal-quality-indicator";
import type { RppgHealthReport } from "@/lib/rppg/types";

function getRecommendedDoctor(r: RppgHealthReport): string {
  if (r.riskFlags?.includes("elevated_heart_rate") || r.riskFlags?.includes("low_heart_rate")) return "Cardiologist";
  if (r.riskFlags?.includes("high_variability")) return "Cardiologist";
  if (r.avgHeartRate > 90 || r.avgHeartRate < 55) return "Primary care physician";
  return "No specialist referral suggested";
}

export default function HeartRatePage() {
  const [report, setReport] = useState<RppgHealthReport | null>(null);
  const [processedSignal, setProcessedSignal] = useState<number[]>([]);
  const [sessions, setSessions] = useState<Array<{
    id: string;
    avg_heart_rate: number;
    signal_quality: number;
    beats_analyzed: number;
    confidence: string;
    created_at: string;
  }>>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("rppg_sessions")
        .select("id, avg_heart_rate, signal_quality, beats_analyzed, confidence, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      setSessions(data ?? []);
    };
    load();
  }, []);

  const handleComplete = async (
    r: RppgHealthReport,
    signal: number[]
  ) => {
    setReport(r);
    setProcessedSignal(signal);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const recommended = getRecommendedDoctor(r);
      try {
        await supabase.from("rppg_sessions").insert({
          user_id: user.id,
          avg_heart_rate: r.avgHeartRate,
          signal_quality: r.signalQuality,
          beats_analyzed: r.beatsAnalyzed,
          confidence: r.confidence,
          report: { ...r, processedSignal: signal },
          processed_signal: signal,
          instantaneous_bpm: r.instantaneousBpm ?? [],
          risk_flags: r.riskFlags ?? [],
          recommended_doctor: recommended,
        });
      } catch {
        // Table may not exist yet
      }
    }
    setSaved(true);
    const { data } = await supabase
      .from("rppg_sessions")
      .select("id, avg_heart_rate, signal_quality, beats_analyzed, confidence, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    setSessions(data ?? []);
  };

  const downloadReport = (r: RppgHealthReport) => {
    const blob = new Blob([JSON.stringify(r, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `heart-rate-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">
        Heart rate measurement
      </h1>
      <p className="mb-8 text-sm text-text-muted">
        Camera-based heart rate using rPPG (Lovisotto et al., CVPRW 2020). Place your fingertip over the camera and hold still for 30 seconds.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="mb-4 text-lg font-medium text-text-primary">
            Capture
          </h2>
          {report ? (
            <div className="space-y-4">
              <p className="text-sm text-text-muted">
                Measurement complete. Start a new measurement below.
              </p>
              <button
                type="button"
                onClick={() => {
                  setReport(null);
                  setProcessedSignal([]);
                }}
                className="w-full rounded-full border border-teal/50 py-2.5 text-sm font-medium text-teal transition-colors hover:bg-teal/10"
              >
                New measurement
              </button>
            </div>
          ) : (
          <CameraCapture
            onComplete={handleComplete}
          />
          )}
        </GlassCard>

        {report && (
          <GlassCard className="p-6">
            <h2 className="mb-4 text-lg font-medium text-text-primary">
              Results
            </h2>
            <div className="space-y-6">
              <HeartRateGauge
                bpm={report.avgHeartRate}
                confidence={report.confidence}
              />
              <SignalQualityIndicator
                quality={report.signalQuality}
                beatsAnalyzed={report.beatsAnalyzed}
              />
              {report.riskFlags.length > 0 && (
                <div className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-400">
                  Flags: {report.riskFlags.join(", ")}
                </div>
              )}
              {processedSignal.length > 0 && (
                <div>
                  <p className="mb-2 text-sm text-text-muted">PPG waveform</p>
                  <PpgWaveform signal={processedSignal} fps={report.fps} />
                </div>
              )}
              <button
                type="button"
                onClick={() => downloadReport(report)}
                className="w-full rounded-full border border-teal/50 py-2.5 text-sm font-medium text-teal transition-colors hover:bg-teal/10"
              >
                Download report (JSON)
              </button>
            </div>
          </GlassCard>
        )}
      </div>

      {sessions.length > 0 && (
        <GlassCard className="mt-8 p-6">
          <h2 className="mb-4 text-lg font-medium text-text-primary">
            Session history
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-text-muted">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Heart rate</th>
                  <th className="pb-3 font-medium">Quality</th>
                  <th className="pb-3 font-medium">Beats</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 text-text-secondary">
                    <td className="py-3">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                    <td className="py-3">{s.avg_heart_rate} BPM</td>
                    <td className="py-3">
                      {Math.round(s.signal_quality * 100)}%
                    </td>
                    <td className="py-3">{s.beats_analyzed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      <p className="mt-8 text-center text-xs text-text-muted">
        This is not a medical device. For informational use only.
      </p>
    </div>
  );
}
