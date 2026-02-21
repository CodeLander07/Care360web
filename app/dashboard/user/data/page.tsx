"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { PpgWaveform } from "@/components/rppg/ppg-waveform";
import { BpmFluctuationChart } from "@/components/rppg/bpm-fluctuation-chart";

type Session = {
  id: string;
  avg_heart_rate: number;
  signal_quality: number;
  beats_analyzed: number;
  confidence: string;
  report: {
    processedSignal?: number[];
    instantaneousBpm?: number[];
    fps?: number;
  } | null;
  processed_signal: number[] | null;
  instantaneous_bpm: number[] | null;
  recommended_doctor: string | null;
  created_at: string;
};

export default function UserDataPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("rppg_sessions")
        .select(
          "id, avg_heart_rate, signal_quality, beats_analyzed, confidence, report, processed_signal, instantaneous_bpm, recommended_doctor, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(50);
      setSessions((data ?? []) as Session[]);
    };
    load();
  }, []);

  const getSignal = (s: Session): number[] => {
    const arr = s.processed_signal ?? s.report?.processedSignal;
    return Array.isArray(arr) ? arr : [];
  };

  const getInstantBpm = (s: Session): number[] => {
    const arr = s.instantaneous_bpm ?? s.report?.instantaneousBpm;
    return Array.isArray(arr) ? arr : [];
  };

  const getRecommendedDoctor = (s: Session): string => {
    return s.recommended_doctor ?? "No specialist referral suggested";
  };

  const getFps = (s: Session): number => s.report?.fps ?? 30;

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">My Data</h1>
      <p className="mb-6 text-sm text-text-muted">
        Heart rate history, trends, and recommended follow-ups.
      </p>

      {sessions.length === 0 ? (
        <GlassCard className="p-8">
          <p className="text-text-secondary">
            No heart rate data yet. Record a measurement from the{" "}
            <a
              href="/dashboard/user/heart-rate"
              className="text-teal underline hover:no-underline"
            >
              Heart rate
            </a>{" "}
            page.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <GlassCard key={s.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-lg font-medium text-text-primary">
                    {s.avg_heart_rate} BPM
                  </span>
                  <span className="text-sm text-text-muted">
                    {new Date(s.created_at).toLocaleString()}
                  </span>
                  <span className="rounded-full bg-teal/20 px-2.5 py-0.5 text-xs text-teal">
                    {Math.round(s.signal_quality * 100)}% quality
                  </span>
                </div>
                <span
                  className={`text-text-muted transition-transform ${
                    expandedId === s.id ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {expandedId === s.id && (
                <div className="border-t border-white/10 p-4 space-y-6">
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-text-muted">
                      Heartbeat fluctuation (BPM over time)
                    </h3>
                    <BpmFluctuationChart
                      instantaneousBpm={getInstantBpm(s)}
                      avgBpm={s.avg_heart_rate}
                      fps={getFps(s)}
                    />
                  </div>
                  {getSignal(s).length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-text-muted">
                        PPG waveform
                      </h3>
                      <PpgWaveform signal={getSignal(s)} fps={getFps(s)} />
                    </div>
                  )}
                  <div className="rounded-lg bg-white/5 p-4">
                    <p className="mb-1 text-xs text-text-muted">
                      Recommended doctor
                    </p>
                    <p className="font-medium text-text-primary">
                      {getRecommendedDoctor(s)}
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
